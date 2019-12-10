/**
 * spreadsheetから新たなFormを指定フォルダに作成する
 * セクション付き PageBreakItem=区切りマーク
 * Formのアイテムの作成は何もしなければ手動で作成したのと同じ感覚で区切りを入れたら区切り後のセクションに次に作成したItemは作られる
 * カウンタダウンはForm側のスクリプトで実行する。
 */
function createResevationForm() {  
  //フォーム作成
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var topValues = spreadsheet.getSheetByName('概要').getDataRange().getValues();
 
  var initialSheet = spreadsheet.getSheetByName('初期値');
  var initialValues = initialSheet.getDataRange().getValues();
  var array=initialValues.splice(0, 1)[0];
  var section1Lists=array.map(function(value){
    return fnDatetoString(value,"MM月D日");
  }); 
  var listValues=[];
  var array=[];
  var rowValue=[];
  for(var i=0;i < initialValues.length;i++){
    var rowValue=initialValues[i];
    var array=rowValue.map(function(value){
      return fnDatetoString(value,"H:mm");
    }); 
    listValues.push(array);
  }
  
  var formTitle = topValues[0][1]; //タイトル
  var formDescription = topValues[1][1]; //概要
  var pageDescription = topValues[2][1];//セクションの説明
  var cnt = topValues[3][1];//時間ごとの予約数　時間ごとに予約数が違う場合は作成後先にダミー送信して調整のこと
  var cntkey = {start:'（残 ',last:'）'};//この後に続く数字の後は「）」全角括弧閉じのるのみとする。
  var FOLDER_ID=topValues[4][1];//フォルダiD
    
  var form = FormApp.create(formTitle);
  
  //var FOLDER_ID = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
  var formFile = DriveApp.getFileById(form.getId());
  DriveApp.getFolderById(FOLDER_ID).addFile(formFile);
  DriveApp.getRootFolder().removeFile(formFile);
  
  // Section1 
  form.setDescription(formDescription);
  form.addTextItem().setTitle('氏名').setRequired(true);
  var validationPhoneNum = FormApp.createTextValidation().requireWholeNumber().build();//全部数字
  form.addTextItem().setTitle('内線番号(数字のみ)').setRequired(true).setValidation(validationPhoneNum);
  var pattern = "[a-zA-Z0-9]+";
  var validationmemberID = FormApp.createTextValidation().requireTextMatchesPattern(pattern).build();//英数字
  form.addTextItem().setTitle('社員番号').setRequired(true).setValidation(validationmemberID);  
  //var validationEmail = FormApp.createTextValidation().requireTextIsEmail().build();
  //form.addTextItem().setTitle('メールアドレス').setRequired(true).setValidation(validationEmail);
  var bestdayList = form.addListItem().setTitle('希望日').setRequired(true); 

  //希望日のリスト群は飛び先作成の後に作る  
  //listの選択肢の飛び先セクションを先に作成する必要がある。
  var pages=[];
  
  var dataCol = initialSheet.getLastColumn();
  //初期値設定
  for(var i=0;i<dataCol;i++){
  
    var page=form.addPageBreakItem().setTitle(section1Lists[i]).setHelpText(pageDescription);
    var item = form.addListItem()
    .setTitle(section1Lists[i]) 
    .setChoiceValues(generateArray(listValues,i,cnt,cntkey));
    pages.push(page);
    
  } 
  
  var PageContact=form.addPageBreakItem().setTitle('連絡事項');
  form.addTextItem().setTitle('連絡事項');
  //全てのセクションは最後ラストセクションに行く。
  for(var i=0;i<pages.length;i++){    
    pages[i].setGoToPage(PageContact); 
  }
  
  //セクション1の「希望日」リストの回答によってセクションを移動付きリストで作成
  var valuesDay = [];    
  for(i=0;i<section1Lists.length;i++){
    valuesDay.push(bestdayList.createChoice(section1Lists[i],pages[i]));
  }
  bestdayList.setChoices(valuesDay);

}

/**
 * シート全体の値を取得した二次元配列から、指定の列のデータ（見出し行を除く）を抜き出し一次元配列を構成する
 *
 * @param {Object[][]} シートのデータを二次元配列化した配列
 * @param {number} 配列の列数（0以上のインデックス）
 * @return {Object[]} 指定の列（見出しを除く）のデータによる一次元配列
 */
function generateArray(values, column,cnt,cntkey){
  var i = 1;
  var array = [];
  for(var i = 0; i < values.length; i++){
    if(values[i][column]){
      array.push(values[i][column] + cntkey.start + cnt + cntkey.last);
    }
  }
  return array;
}
/**
 * 値が日付かどうかを判断し日付の場合は文字列に変換して返す
 *
 * @param {value} 値
 * @return {String} 文字列値
 */
function fnDatetoString(value,formatType){
  if ( Object.prototype.toString.call(value) == "[object Date]"){
    var ret = Moment.moment(value).format(formatType);
  }else{
    var ret = value;
  }
  return ret;

}

function onOpen(event){
  //https://www.tuyano.com/index3?id=1184003
  //メニュー配列 ツールにメニュー機能として追加する
  var myMenu=[
    {name: "予約フォーム作成", functionName: "createResevationForm"},
  ];
 
  SpreadsheetApp.getActiveSpreadsheet().addMenu("独自ツール",myMenu); //メニューを追加
  
}
/**
 * 参考
//https://developers.google.com/apps-script/reference/forms/list-item
//https://tonari-it.com/gas-form-add-items/
//https://teratail.com/questions/45539
*/
