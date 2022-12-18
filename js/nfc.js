import { NFCPortLib, NFCPortError, Configuration, DetectionOption, CommunicationOption, TargetCard } from 'https://cdn.felica-support.sony.biz/webclient/trial/NFCPortLib.js';

const chiba_nyan = "https://cdn.glitch.global/fd6a712e-c16d-4909-81cd-c5c9d7375e15/tibani_pose_kiden.png?v=1671265414285";

document.getElementById('scan').addEventListener('click', function () {
	felica_card();
	return;
});


async function felica_card(){
	(async()=>{
		console.log('FeliCaを読み取り開始！');

		let lib = null;

		try {
			/* create NFCPortLib object */
			lib = new NFCPortLib();

			/* init() */
			let config = new Configuration(500 /* ackTimeout */, 500 /* receiveTimeout */, true /* autoBaudRate*/, true /* autoDeviceSelect */);
			await lib.init(config);

			/* open() */
			await lib.open();
			console.log('deviceName : ' + lib.deviceName);

			/* detectCard(FeliCa Card) */
			let detectOption = new DetectionOption(new Uint8Array([0xff, 0xff]), 0, true, false, null);
			let card = await lib.detectCard('iso18092', detectOption)
				.then(ret => {

					if (ret.systemCode == null) {
						console.log('IDm : ' + _array_tohexs(ret.idm) +
							'\nPMm : ' + _array_tohexs(ret.pmm) +
							'\ntargetCardBaudRate : ' + lib.targetCardBaudRate + 'kbps');
					} else {
						console.log('IDm : ' + _array_tohexs(ret.idm) +
							'\nPMm : ' + _array_tohexs(ret.pmm) +
							'\nSystemCode : ' + _array_tohexs(ret.systemCode) +
							'\ntargetCardBaudRate : ' + lib.targetCardBaudRate + 'kbps');
						console.log(ret.constructor.name);
					}
					return ret;
				}, (error) => {
					throw (error);
				});

			/* ブロック読むコマンド */
			let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 1, 0x09, 0x30, 1, 0x80, 0x00]);
      //let felica_read_without_encryption = new Uint8Array([16, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 1, 0x09, 0x30, 0x03, 0x80, 0x00, 0x81, 0x01, 0x83, 0x02]);
			_array_copy(felica_read_without_encryption, 2, card.idm, 0, card.idm.length);
      console.log(_array_tohexs(felica_read_without_encryption));
			let response = await lib.communicateThru(felica_read_without_encryption, 100, detectOption)
				.then(ret => {
					return ret;
				}, (error) => {
					throw (error);
				});
			
			/* close() */
			await lib.close();
			lib = null;

			console.log('Success');
      
      /* 学籍番号をセットするし、送信 */
      ((response)=>{
        console.log("学籍番号");
        console.log(_array_tohexs(response));
        const studentNumber = new TextDecoder().decode(response.slice(13, 20));
        //const studentNumber = new TextDecoder().decode(response.slice(13, 20));
        console.log(studentNumber);
        _set_select_box_("Q0A", studentNumber.substr(0, 4));
        _set_select_box_("Q0B", studentNumber.substr(4, 1));
        _set_select_box_("Q0C", studentNumber.substr(5, 1));
        _set_select_box_("Q0D", studentNumber.substr(6, 1));
        // 機電なら千葉にゃん表示
        if(studentNumber.substr(2, 2) === "A2"){
          const pic = document.getElementById("pic");
          pic.src = chiba_nyan;
          pic.style.visibility = 'visible'; 
        }
        //document.getElementById("submit").click();
      })(response);
      

		} catch (error) {
			console.log('Error errorType : ' + error.errorType);
			console.log('      message : ' + error.message);

			if (lib != null) {
				await lib.close();
				lib = null;
			}
		}

		console.log('[Reading a FeliCa Card] End');
		return;
	})();
}

function _set_select_box_(strID, strNum){
  const select = document.getElementsByName(strID);
  const options = select[0].options;
  Array.from(options).forEach((value, index)=>{
    if(value.label == strNum){
      select[0].selectedIndex = index;
    };
  });
}

function _def_val(param, def) {
	return (param === undefined) ? def : param;
}

function _array_slice(array, offset, length) {
	let result;

	length = _def_val(length, array.length - offset);
	result = [];
	_array_copy(result, 0, array, offset, length);

	return result;
}

function _bytes2hexs(bytes, sep) {
	let str;

	sep = _def_val(sep, ' ');

	return bytes.map(function (byte) {
		str = byte.toString(16);
		return byte < 0x10 ? '0' + str : str;
	}).join(sep).toUpperCase();
}

function _array_tohexs(array, offset, length) {
	let temp;

	offset = _def_val(offset, 0);
	length = _def_val(length, array.length - offset);

	temp = _array_slice(array, offset, length);
	return _bytes2hexs(temp, '');
}

function _array_copy(dest, dest_offset, src, src_offset, length) {
	let idx;

	src_offset = _def_val(src_offset, 0);
	length = _def_val(length, src.length);

	for (idx = 0; idx < length; idx++) {
		dest[dest_offset + idx] = src[src_offset + idx];
	}

	return dest;
}