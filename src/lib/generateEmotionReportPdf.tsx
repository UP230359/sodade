import jsPDF from "jspdf";
import { MoodEntry } from "@/store/moodSlice";
import { ChartDataPoint, MOOD_LABELS } from "@/components/mood/EmotionLineChart";

//Forma que tienen las estadísticas que le pasamos al PDF
//se calculan en MoodChart.tsx y aquí solo las usamos para dibujarlas

export interface EmotionStats {
  totalEntries: number;
  mostCommonMood: string;
  lastWeekEntries: number;
  moodCounts: Record<MoodEntry["mood"], number>;
}

//Función principal que arma y descarga el PDF del reporte
//recibe la imagen del gráfico ya convertida y los datos que va a mostrar

export async function generateEmotionReportPdf(
  chartImageDataUrl: string,
  chartImageWidthPx: number,
  chartImageHeightPx: number,
  chartData: ChartDataPoint[],
  stats: EmotionStats,
) {
  //Creamos un PDF nuevo en formato A4 vertical
  //unit es milímetros, así es más fácil posicionar cosas

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  //Escribimos el título del reporte en el PDF
  //tamaño 24, color gris oscuro

  pdf.setFontSize(24);
  pdf.setTextColor(31, 41, 55);
  pdf.text("Emotion Timeline Report", 20, 25);

  //Escribimos la fecha de generación del reporte
  //en formato largo (ej: "Wednesday, July 29, 2026")

  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    20,
    32,
  );

  //Dibujamos una línea para separar el encabezado del contenido
  //color gris claro

  pdf.setDrawColor(229, 231, 235);
  pdf.line(20, 35, 190, 35);

  //Colocamos la imagen del gráfico en el PDF
  //la hacemos más pequeña para que quepa bien (170mm de ancho)

  const imgWidth = 170;
  const imgHeight = (chartImageHeightPx * imgWidth) / chartImageWidthPx;
  pdf.addImage(chartImageDataUrl, "PNG", 20, 40, imgWidth, imgHeight);

  //Guardamos dónde empieza el siguiente contenido
  //es después de la imagen, con algo de espacio

  let currentY = 45 + imgHeight + 15;

  //Función para verificar que tenemos espacio en la página
  //si no cabe, agregamos una página nueva

  const PAGE_HEIGHT = 297;
  const BOTTOM_MARGIN = 20;
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = 20;
    }
  };

  //Verificamos espacio y dibujamos el título de estadísticas
  //es una sección con las métricas principales

  ensureSpace(8 + 8 + 3 * 7);

  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text("Summary Statistics", 20, currentY);

  currentY += 8;

  //Dibujamos el encabezado de la tabla de estadísticas
  //con fondo gris claro para que se vea como un header

  pdf.setFontSize(10);
  pdf.setFillColor(243, 244, 246);
  pdf.rect(20, currentY, 170, 8, "F");
  pdf.setTextColor(55, 65, 81);
  pdf.text("Metric", 25, currentY + 6);
  pdf.text("Value", 155, currentY + 6);

  currentY += 8;

  //Cambiamos el color para las filas normales
  //gris oscuro y fuente más pequeña

  pdf.setTextColor(75, 85, 99);
  pdf.setFontSize(9);

  //Preparamos las filas de estadísticas para mostrar
  //total, emoción más común y de esta semana

  const statsRows = [
    ["Total Emotions Logged", `${stats.totalEntries}`],
    ["Most Common Emotion", `${MOOD_LABELS[stats.mostCommonMood as MoodEntry["mood"]]}`],
    ["Entries This Week", `${stats.lastWeekEntries}`],
  ];

  //Dibujamos cada fila de estadísticas
  //ensureSpace verifica que quepa antes de dibujarlo

  statsRows.forEach((row) => {
    ensureSpace(7);
    pdf.rect(20, currentY, 170, 7);
    pdf.text(row[0], 25, currentY + 5);
    pdf.text(row[1], 155, currentY + 5);
    currentY += 7;
  });

  currentY += 5;

  //Sacamos solo las emociones que tienen al menos una entrada
  //no mostramos las emociones con 0 registros

  const distributionRows = Object.entries(stats.moodCounts).filter(
    ([, count]) => count > 0,
  );

  //Verificamos que quepa la sección de distribución
  //con el título, encabezado y filas

  ensureSpace(8 + 8 + Math.min(distributionRows.length, 3) * 7);

  //Título de la sección de distribución de emociones
  //muestra cuántas veces aparece cada emoción

  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text("Emotion Distribution", 20, currentY);

  currentY += 8;

  //Encabezado de la tabla con las columnas
  //emoción, cantidad y porcentaje

  pdf.setFontSize(10);
  pdf.setFillColor(243, 244, 246);
  pdf.rect(20, currentY, 170, 8, "F");
  pdf.setTextColor(55, 65, 81);
  pdf.text("Emotion", 25, currentY + 6);
  pdf.text("Count", 120, currentY + 6);
  pdf.text("Percentage", 155, currentY + 6);

  currentY += 8;

  //Preparamos el color y tamaño para las filas
  //gris oscuro más pequeño para los datos

  pdf.setTextColor(75, 85, 99);
  pdf.setFontSize(9);

  //Dibujamos cada emoción con su cantidad y porcentaje
  //calculamos el porcentaje dividiendo por el total

  distributionRows.forEach(([mood, count]) => {
    const percentage = ((count / stats.totalEntries) * 100).toFixed(1);
    ensureSpace(7);
    pdf.rect(20, currentY, 170, 7);
    pdf.text(MOOD_LABELS[mood as MoodEntry["mood"]], 25, currentY + 5);
    pdf.text(count.toString(), 120, currentY + 5);
    pdf.text(`${percentage}%`, 155, currentY + 5);
    currentY += 7;
  });

  currentY += 5;

  //Sacamos las últimas 10 emociones y las invertimos
  //para mostrar primero la más reciente (de abajo para arriba)

  const recentEntries = chartData.slice(-10).reverse();

  //Verificamos espacio para la sección de entradas recientes
  //con título, encabezado y filas

  ensureSpace(8 + 8 + Math.min(recentEntries.length, 3) * 7);

  //Título de las entradas recientes
  //muestra solo las últimas 10 emociones registradas

  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text("Recent Entries", 20, currentY);

  currentY += 8;

  //Esta función dibuja el encabezado de la tabla de entradas recientes
  //la definimos como función porque si la tabla se parte en dos páginas,
  //necesitamos redibujarlo en la segunda página

  const drawRecentEntriesHeader = () => {
    pdf.setFontSize(10);
    pdf.setFillColor(243, 244, 246);
    pdf.rect(20, currentY, 170, 8, "F");
    pdf.setTextColor(55, 65, 81);
    pdf.text("Date", 25, currentY + 6);
    pdf.text("Time", 55, currentY + 6);
    pdf.text("Emotion", 85, currentY + 6);
    pdf.text("Note", 140, currentY + 6);
    currentY += 8;
  };

  //Dibujamos el encabezado por primera vez
  //lo guardamos como función para reutilizarlo si hay página nueva

  drawRecentEntriesHeader();

  //Color y tamaño para las filas de entradas recientes
  //gris oscuro y más pequeño que el encabezado

  pdf.setTextColor(75, 85, 99);
  pdf.setFontSize(8);

  //Dibujamos cada entrada reciente
  //mostramos fecha, hora, emoción y una previa de la nota (primeros 20 caracteres)

  recentEntries.forEach((entry) => {
    //Si hay nota, sacamos solo los primeros 20 caracteres
    //si no hay nota, mostramos un guión "-"

    const notePreview = entry.note ? entry.note.substring(0, 20) : "-";

    //Verificamos si la fila cabe en la página actual
    //si no cabe, agregamos una página nueva y redibujamos el encabezado

    const neededForRow = 7;
    if (currentY + neededForRow > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = 20;
      drawRecentEntriesHeader();
      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(8);
    }

    //Dibujamos la fila con los datos de la entrada
    //cada columna en su posición correspondiente

    pdf.rect(20, currentY, 170, 7);
    pdf.text(entry.date, 25, currentY + 5);
    pdf.text(entry.time, 55, currentY + 5);
    pdf.text(MOOD_LABELS[entry.mood], 85, currentY + 5);
    pdf.text(notePreview, 140, currentY + 5);
    currentY += 7;
  });

  //Agregamos el pie de página en todas las páginas del PDF
  //mostramos número de página (ej: "Page 1 of 3")

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    //En cada página, colocamos el footer al final
    //texto gris claro con la información

    pdf.setPage(page);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `Report generated by Sodade - Emotion Tracking Platform | Page ${page} of ${totalPages}`,
      20,
      PAGE_HEIGHT - 12,
    );
  }

  //Descargamos el PDF con un nombre que incluye la fecha
  //así cada reporte tiene un nombre único

  pdf.save(`emotion-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
