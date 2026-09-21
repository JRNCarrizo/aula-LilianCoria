/**
 * Catálogo de actividades del Aula Lilian Coria.
 *
 * Para agregar una actividad nueva:
 * 1. Crear la carpeta actividades/nombre-de-la-actividad/
 * 2. Copiar el index.html de la-tortilla-de-papas y adaptar textos
 * 3. Poner la ficha imprimible en ficha.html
 * 4. Sumar un objeto en esta lista (el id debe coincidir con la carpeta)
 * 5. Completar grado (1.º, 2.º, etc.) y area (Lengua, Matemática, Ciencias, etc.)
 * 6. Actualizar también data/actividades.json
 */
window.AULA_ACTIVIDADES = [
  {
    id: "la-tortilla-de-papas",
    titulo: "La tortilla de papas",
    kicker: "Después de leer",
    grado: "1.º",
    area: "Prácticas del Lenguaje",
    tipo: "Ficha imprimible",
    cuento: "La tortilla de papas",
    autoras: "Sandra Siemens y Claudia Degliuomini",
    resumen: "Actividades de letras iniciales, escritura de nombres, género y número, a partir del cuento de Sebastiana y Nicolasa.",
    paginas: 8,
    destacada: true
  }
];
