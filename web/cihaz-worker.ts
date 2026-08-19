/* WebLLM motorunu ayrı bir iş parçacığında çalıştıran worker.
   Sayfa donmadan modelin düşünmesini sağlar. */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const isleyici = new WebWorkerMLCEngineHandler();
self.onmessage = (mesaj: MessageEvent) => isleyici.onmessage(mesaj);
