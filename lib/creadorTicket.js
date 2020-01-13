const path = require('path');
const uuid = require('uuid');
const Jimp = require('jimp');
const { Evento, Usuario } = require('./schema');

/**
 *
 * @param {Evento} evento
 * @param {Usuario} usuario
 */
async function creador(evento, usuario) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const fecha = new Date();
  let mili = fecha.getMilliseconds().toString();
  mili = mili.length === 3 ? mili : mili.length === 2 ? "0" + mili : "00" + mili;
  const hora = fecha.toLocaleString("es-PE", options) + ":" + mili;
  let xxx = (await evento.getHistorial()).length;
  xxx = xxx.length === 3 ? xxx : xxx.length === 2 ? "0" + xxx : "00" + xxx;
  const image = await Jimp.read('./ticket.png');
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const font2 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const idString = "U"+usuario.get('id') + "-" +"E"+evento.get('id');
  const uid = uuid();
  let description1 = "Ticket generado automáticamente por la gentil donación";
  let description2 = "de "+xxx+" recursos de estudio, muchas gracias por su apoyo.";
  let description3 = uid;
  const p = path.resolve(path.join('../public/images', uid+'.png'));
  let description4 = hora;
  return new Promise((resolve, reject) => {
    image
      .print(font, 230, 375, description1)
      .print(font, 220, 415, description2)
      .print(font2, 200, 500, description3)
      .print(font2, 900, 500, description4)
      .rotate(90)
      .print(font, 95, 105, idString)
      .rotate(180)
      .print(font, 95, 105, idString)
      .rotate(90)
      .write(p, (e, v) => {
        if (e) return reject(e);
        return resolve(uid + '.png');
      });
  })
}

module.exports = creador;