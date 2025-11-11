// src/helpers/helpers.js
export function ok(res, data, message = 'OK') {
  return res.status(200).json({ message, data });
}
export function created(res, data, message = 'Creado') {
  return res.status(201).json({ message, data });
}
export function bad(res, msg) {
  return res.status(400).json({ message: msg });
}
export function notFound(res, msg) {
  return res.status(404).json({ message: msg });
}
