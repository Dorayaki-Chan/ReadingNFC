/**
 * AndroidスマホならScanボタンを表示
 */
(()=>{
    const isPC = (()=>{
        if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
          // スマホ・タブレット（iOS・Android）の場合の処理を記述
          return false;
        }else{
          // PCの場合の処理を記述
          return true;
        }
    })();
    if(isPC){
        document.getElementById('scan').style.visibility = 'visible';
    }
    else{
        document.getElementById('scan').style.visibility = 'hidden';
    }
})();
