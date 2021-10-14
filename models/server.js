const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../database/config');

const path = require ('path');
const hbs = require ('hbs');

const multer = require ('multer');

const Video = require('./videos')

const port = process.env.PORT || 3000 ; 


const cloudinary = require('cloudinary').v2;
const { Videos } = require('.');
cloudinary.config( process.env.CLOUDINARY_URL );


const publicDirectoryPath = path.join(__dirname, '../public');
const viwsPath = path.join(__dirname, '../templates/views')

const partialsPath = path.join(__dirname, '../templates/partials')


class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;


        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:false}))
        
        const storage = multer.diskStorage({
            destination : path.join(__dirname, '../uploads' ), 
            filename: (req , file , cb ) =>{
                cb(null , new Date().getTime()+ path.extname(file.originalname));
            }
        })
        
        this.app.use( multer ( { storage }).single('video'));
        


        this.paths = {
            auth:       '/api/auth',
            buscar:     '/api/buscar',
            categorias: '/api/categorias',
            Videos:     '/api/videos',
            usuarios:   '/api/usuarios',
            uploads:    '/api/uploads',
        }


        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        //Rutas paginas 
        this.routespages()

    }

    async conectarDB() {
        await dbConnection();
    }


    routespages(){
        this.app.set('view engine','hbs')
        this.app.set('views', viwsPath )
        hbs.registerPartials(partialsPath)

        this.app.use(express.static(publicDirectoryPath));

        this.app.get('' , async (req , res ) =>{
           
            const videos = await Videos.find();
             
            res.render('index',{
                videos ,
                title: 'Mini youtube - Home ', 
                name: 'Gustavo Rodríguez'
            })
        })


        this.app.get('/about', (req , res)=>{
            res.render('about', {
                title: 'About', 
                name: 'Gustavo rodríguez '
            })
        })

        this.app.get('/uploadvideo', async (req , res)=>{

            const videos = await Videos.find();    

            res.render('uploadvideo', {
                videos, 
                helpText: 'Upload your favorite videos' , 
                title:'Upload video', 
                name : 'Gustavo Rodriguez'
            })
        })
        
        this.app.post('/uploadvideo', async (req, res)=>{
             try {   
            const { title , description, tags  } = req.body
            //console.log(req.file);
            
            const result =  await cloudinary.uploader.upload(req.file.path,{
                resource_type: "video"
            }) 

            //console.log(result);
            const newVideo = await new Video ({
                title  , 
                description ,
                videoUrl : result.url,
                tags, 
                public_id : result.public_id , 
                loadingDate : new Date(), 
                iLike: 0 , 
                notLike: 0 
            })  

            await newVideo.save ();

            res.send('REceived');
        }
        catch (err){
            console.log(err);
        }
        })

       /* this.app.get('/', async (req, res)=>{
            const videos = await Videos.find();
        })*/


        this.app.get ('*', (req , res )=>{
            res.render('page404',{
                title : 'Page 404', 
                name: 'Gustavo Rodriguez',
                errorMessage: 'Page not found'
            })
        })
    }


    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );

        // Fileupload - Carga de archivos
        this.app.use( fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));
/*
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:false}))

        const storage = multer.diskStorage({
            destination : path.join(__dirname, 'uploads' ), 
            filename: (req , file , cb ) =>{
                cb(null , new Date().getTime()+ path.extname(file.originalname));
            }
        })

        this.app.use( multer ( { storage }).single('image'));
*/
    }

    routes() {
        
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.buscar, require('../routes/buscar'));
        this.app.use( this.paths.categorias, require('../routes/categorias'));
        this.app.use( this.paths.Videos, require('../routes/Videos'));
        this.app.use( this.paths.usuarios, require('../routes/usuarios'));
        this.app.use( this.paths.uploads, require('../routes/uploads'));
        
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




module.exports = Server;
