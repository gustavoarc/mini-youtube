const { response } = require('express');
const { Videos } = require('../models');


const obtenerVideos = async(req, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, Videos ] = await Promise.all([
        Videos.countDocuments(query),
        Videos.find(query)
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        Videos
    });
}

const obtenerVideo = async(req, res = response ) => {

    const { id } = req.params;
    const Videos = await Videos.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre');

    res.json( Videos );

}

const crearVideo = async(req, res = response ) => {

    const { estado, usuario, ...body } = req.body;

    const VideosDB = await Videos.findOne({ nombre: body.nombre });

    if ( VideosDB ) {
        return res.status(400).json({
            msg: `El Videos ${ VideosDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const Videos = new Videos( data );

    // Guardar DB
    await Videos.save();

    res.status(201).json(Videos);

}

const actualizarVideo = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    if( data.nombre ) {
        data.nombre  = data.nombre.toUpperCase();
    }

    data.usuario = req.usuario._id;

    const Videos = await Videos.findByIdAndUpdate(id, data, { new: true });

    res.json( Videos );

}

const borrarVideo = async(req, res = response ) => {

    const { id } = req.params;
    const VideosBorrado = await Videos.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( VideosBorrado );
}




module.exports = {
    crearVideo,
    obtenerVideos,
    obtenerVideo,
    actualizarVideo,
    borrarVideo
}