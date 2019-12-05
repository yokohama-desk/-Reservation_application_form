/*
* https://teratail.com/questions/45539
*/
function move_question_before_1stSection() {

  var frmid = "フォームのファイルID"; //フォームのID
  var frm = FormApp.openById(frmid);

  getCategory()//新規の設問を追加（TS8332さんのfunctionをコール）  

  Logger.log("【移動実行前のItemの状態】");
  　　question_Get_Id()
  Logger.log("-------------------------");

  var Items =frm.getItems();//既存の全itemを取得
  var qui = Items[Items.length-1]//変数quiに最終出現設問のobjectを格納
  var quiID = qui.getId();//指定した設問のIDを取得
  var quiItem = frm.getItemById(quiID);
  var quiIndex = qui.asListItem().getIndex()

  var pageBreak =frm.getItems(FormApp.ItemType.PAGE_BREAK);//既存の全PAGE_BREAKを取得

  if (pageBreak.length > 0){
    var pageIndex = pageBreak[0].asPageBreakItem().getIndex();//最初(=[0])のPAGE_BREAKのIndexを取得
    frm.moveItem(quiItem,pageIndex);//最初のPAGE_BREAKのIndex位置(=直前)に設問を移動

    //または下記でもよい
    //frm.moveItem(quiIndex,pageIndex);//最初のPAGE_BREAKのIndex位置(=直前)に設問を移動
  }
  Logger.log("【移動実行後のItemの状態】");
　　　question_Get_Id()
}

function question_Get_Id(){//INDEXやIDをログに吐き出す

  var form = "フォームのファイルID"; //フォームのID
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) { //回答内容を取得
    var item = items[i];

    Logger.log("Index:" + i  + " " + item.getTitle() + "　->　ID: " +item.getId().toString() + "　/　" +item.getType());
  }
}
