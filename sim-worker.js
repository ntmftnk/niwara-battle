/* ニワラバトル v11 environment simulation worker */
importScripts('app-config.js','game-data.js','sim-core.js');
self.onmessage = event => {
  const msg = event.data || {};
  if (msg.type !== 'run') return;
  const started = performance.now();
  try {
    const stats = self.NiwaraSimCore.simulateRange(msg.config || {}, Number(msg.start)||0, Number(msg.count)||0);
    self.postMessage({type:'done', id:msg.id, start:msg.start, count:msg.count, stats, ms:performance.now()-started});
  } catch (error) {
    self.postMessage({type:'error', id:msg.id, start:msg.start, count:msg.count, error:String(error?.stack || error)});
  }
};
