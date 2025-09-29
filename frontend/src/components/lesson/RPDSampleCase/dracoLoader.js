import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader();

// ใช้ CDN ของ Google และตั้งค่า WASM
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
dracoLoader.setDecoderConfig({ type: "wasm" });

console.log("🔧 DRACO Loader configured with path:", "https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

export default dracoLoader;
