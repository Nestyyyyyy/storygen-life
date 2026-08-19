/* GitHub Pages sürümünün girişi: sunucu yok, her şey tarayıcıda.
   Yapay zekâ iki yoldan çalışır: cihazda inen bizim model (varsayılan
   öneri, limitsiz) ya da oyuncunun kendi anahtarı. */

import { createRoot } from "react-dom/client";
import HayatZeka from "@/components/HayatZeka";
import { cihazWorkerYolu } from "@/lib/hayat/zeka-cihaz";

// Model, sayfayı dondurmamak için ayrı bir iş parçacığında düşünür.
cihazWorkerYolu("./cihaz-worker.js");

createRoot(document.getElementById("oyun")!).render(<HayatZeka />);
