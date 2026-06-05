


function normaliser(texte) {
  return texte
    .toLowerCase()
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ùûü]/g, "u")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ç]/g, "c");
}

export default normaliser;