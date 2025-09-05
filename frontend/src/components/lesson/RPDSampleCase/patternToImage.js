export async function patternToImage(patternText) {
  return new Promise((resolve) => {
    const size = 200;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);

    const lines = patternText.trim().split("/n");
    const gridSize = lines.length;
    const cellSize = size / gridSize;

    for (let y = 0; y < gridSize; y++) {
      const values = lines[y].trim().split(" ");
      for ( let x = 0; x < gridSize; x++) {
        ctx.fillStyle = val > 0.5 ? "#000" : "#fff";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    resolve(canvas.toDataURL("image/png"));
  })
}