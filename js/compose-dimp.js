var DimpCompose={last_msg:"",textarea_ready:true,confirmCancel:function(){if(window.confirm(DIMP.text_compose.cancel)){if(DIMP.conf_compose.auto_save_interval_val){DimpCore.doAction("DeleteDraft",{index:$F("index")})}return this._closeCompose()}},_closeCompose:function(){if(DIMP.conf_compose.qreply){this.closeQReply()}else{if(DIMP.baseWindow||DIMP.conf_compose.popup){DimpCore.closePopup()}else{DimpCore.redirect(DIMP.conf.URI_DIMP_INBOX)}}},closeQReply:function(){var a=$("attach_list").childElements();this.last_msg="";if(a.size()){this.removeAttach(a)}$("draft_index","composeCache").invoke("setValue","");$("qreply","sendcc","sendbcc").invoke("hide");[$("msgData"),$("togglecc").up(),$("togglebcc").up()].invoke("show");if(this.editor_on){this.toggleHtmlEditor()}$("compose").reset();if(this.auto_save_interval){this.auto_save_interval.stop()}},change_identity:function(){var e,b,g,f,a=$F("identity"),i=this.get_identity($F("last_identity")),h=$("message"),d=this.get_identity(a),c=$("save_sent_mail");$("sent_mail_folder_label").setText(d.id[5]);$("bcc").setValue(d.id[6]);if(c){c.writeAttribute("checked",d.id[4])}if(this.editor_on){b=FCKeditorAPI.GetInstance("message").GetHTML().replace(/\r\n/g,"\n");e="<p><!--begin_signature--><!--end_signature--></p>";g="<p><!--begin_signature-->"+d.sig.replace(/^ ?<br \/>\n/,"").replace(/ +/g," ")+"<!--end_signature--></p>";b=b.replace(/<p>\s*<!--begin_signature-->[\s\S]*?<!--end_signature-->\s*<\/p>/,e)}else{b=$F(h).replace(/\r\n/g,"\n");e=i.sig;g=d.sig}f=(i.id[2])?b.indexOf(e):b.lastIndexOf(e);if(f!=-1){if(d.id[2]==i.id[2]){b=b.substring(0,f)+g+b.substring(f+e.length,b.length)}else{if(d.id[2]){b=g+b.substring(0,f)+b.substring(f+e.length,b.length)}else{b=b.substring(0,f)+b.substring(f+e.length,b.length)+g}}b=b.replace(/\r\n/g,"\n").replace(/\n/g,"\r\n");if(this.editor_on){FCKeditorAPI.GetInstance("message").SetHTML(b)}else{h.setValue(b)}$("last_identity").setValue(a)}},get_identity:function(b,a){a=Object.isUndefined(a)?this.editor_on:a;return{id:DIMP.conf_compose.identities[b],sig:DIMP.conf_compose.identities[b][(a?1:0)].replace(/^\n/,"")}},uniqueSubmit:function(b){var a,d,f,e=$("compose");if(DIMP.SpellCheckerObject){DIMP.SpellCheckerObject.resume();if(!this.textarea_ready){this.uniqueSubmit.bind(this,b).defer();return}}e.setStyle({cursor:"wait"});if(b=="send_message"||b=="save_draft"){this.button_pressed=true;switch(b){case"send_message":if(!this.sbtext){f=$("send_button");this.sbtext=f.getText();f.setText(DIMP.text_compose.sending)}break;case"save_draft":if(!this.dbtext){a=$("draft_button");this.dbtext=a.getText();a.setText(DIMP.text_compose.saving)}break}if(this.uploading){(function(){if(this.button_pressed){this.uniqueSubmit(b)}}).bind(this).delay(0.25);return}}$("action").setValue(b);if(b=="add_attachment"){this.uploading=true;e.submit()}else{if(this.editor_on){FCKeditorAPI.GetInstance("message").UpdateLinkedField()}d=e.serialize(true);if(!DIMP.baseWindow){d.nonotify=true}DimpCore.doAction("*"+DIMP.conf.compose_url,d,null,this.uniqueSubmitCallback.bind(this))}},uniqueSubmitCallback:function(b){var a,c=b.response;if(!c){return}if(c.imp_compose){$("composeCache").setValue(c.imp_compose)}if(c.success||c.action=="add_attachment"){switch(c.action){case"auto_save_draft":this.button_pressed=false;$("draft_index").setValue(c.draft_index);break;case"save_draft":this.button_pressed=false;if(DIMP.baseWindow){DIMP.baseWindow.DimpBase.pollFolders();DIMP.baseWindow.DimpCore.showNotifications(b.msgs)}if(DIMP.conf_compose.close_draft){return this._closeCompose()}break;case"send_message":this.button_pressed=false;if(DIMP.baseWindow){switch(c.reply_type){case"reply":DIMP.baseWindow.DimpBase.flag("answered",c.index,c.reply_folder);break;case"forward":DIMP.baseWindow.DimpBase.flag("forwarded",c.index,c.reply_folder);break}if(c.folder){DIMP.baseWindow.DimpBase.createFolder(c.folder)}if(c.draft_delete){DIMP.baseWindow.DimpBase.pollFolders()}DIMP.baseWindow.DimpCore.showNotifications(b.msgs)}return this._closeCompose();case"add_attachment":this.uploading=false;if(c.success){this.addAttach(c.info.number,c.info.name,c.info.type,c.info.size)}else{this.button_pressed=false}if(DIMP.conf_compose.attach_limit!=-1&&$("attach_list").childElements().size()>DIMP.conf_compose.attach_limit){$("upload").writeAttribute("disabled",false);a=new Element("DIV",[DIMP.text_compose.attachment_limit])}else{a=new Element("INPUT",{type:"file",name:"file_1"});a.observe("change",this.uploadAttachment.bind(this))}$("upload_wait").replace(a.writeAttribute("id","upload"));this.resizeMsgArea();break}}else{this.button_pressed=false}$("compose").setStyle({cursor:null});if(!this.button_pressed){if(this.sbtext){$("send_button").setText(this.sbtext)}if(this.dbtext){$("draft_button").setText(this.dbtext)}this.dbtext=this.sbtext=null}DimpCore.showNotifications(b.msgs)},toggleHtmlEditor:function(a){if(!DIMP.conf_compose.rte_avail){return}a=a||false;if(DIMP.SpellCheckerObject){DIMP.SpellCheckerObject.resume()}var c;if(this.editor_on){this.editor_on=false;c=FCKeditorAPI.GetInstance("message").GetHTML();$("messageParent").childElements().invoke("hide");$("message").show();DimpCore.doAction("Html2Text",{text:c},null,this.setMessageText.bind(this),{asynchronous:false})}else{this.editor_on=true;if(!a){DimpCore.doAction("Text2Html",{text:$F("message")},null,this.setMessageText.bind(this),{asynchronous:false})}oFCKeditor.Height=this.getMsgAreaHeight();try{FCKeditorAPI.GetInstance("message").SetHTML($F("message"));$("messageParent").childElements().invoke("show");$("message").hide()}catch(b){this._RTELoading("show");FCKeditor_OnComplete=this._RTELoading.curry("hide");oFCKeditor.ReplaceTextarea()}}$("htmlcheckbox").checked=this.editor_on;$("html").setValue(this.editor_on?1:0)},_RTELoading:function(b){var c,a;if(!$("rteloading")){a=new Element("DIV",{id:"rteloading"}).clonePosition($("messageParent"));$(document.body).insert(a);c=a.viewportOffset();$(document.body).insert(new Element("SPAN",{id:"rteloadingtxt"}).setStyle({top:(c.top+15)+"px",left:(c.left+15)+"px"}).insert(DIMP.text.loading))}$("rteloading","rteloadingtxt").invoke(b)},toggleHtmlCheckbox:function(){if(!this.editor_on||window.confirm(DIMP.text_compose.toggle_html)){this.toggleHtmlEditor()}},getMsgAreaHeight:function(){return document.viewport.getHeight()-$("messageParent").cumulativeOffset()[1]-this.mp_padding},initializeSpellChecker:function(){if(!DIMP.conf_compose.rte_avail){return}if(typeof DIMP.SpellCheckerObject!="object"){this.initializeSpellChecker.bind(this).defer();return}DIMP.SpellCheckerObject.onBeforeSpellCheck=function(){if(!this.editor_on){return}DIMP.SpellCheckerObject.htmlAreaParent="messageParent";DIMP.SpellCheckerObject.htmlArea=$("message").adjacent("iframe[id*=message]").first();$("message").setValue(FCKeditorAPI.GetInstance("message").GetHTML());this.textarea_ready=false}.bind(this);DIMP.SpellCheckerObject.onAfterSpellCheck=function(){if(!this.editor_on){return}DIMP.SpellCheckerObject.htmlArea=DIMP.SpellCheckerObject.htmlAreaParent=null;var a=FCKeditorAPI.GetInstance("message");a.SetHTML($F("message"));a.Events.AttachEvent("OnAfterSetHTML",function(){this.textarea_ready=true}.bind(this))}.bind(this)},setMessageText:function(b){var a=$("message");if(!a){$("messageParent").insert(new Element("TEXTAREA",{id:"message",name:"message",style:"width:100%;"}).insert(b.response.text))}else{a.setValue(b.response.text)}if(!this.editor_on){this.resizeMsgArea()}},fillForm:function(g,h,b,e){if(!this.resizeto){this.fillForm.bind(this,g,h,b,e).defer();return}var a,d,c=this.get_identity($F("last_identity")),f=$("message");if(!this.last_msg.empty()&&this.last_msg!=$F(f).replace(/\r/g,"")&&!window.confirm(DIMP.text_compose.fillform)){return}if(DIMP.conf_compose.auto_save_interval_val&&!this.auto_save_interval){this.auto_save_interval=new PeriodicalExecuter(function(){var i;if(this.editor_on){i=FCKeditorAPI.GetInstance("message").GetHTML()}else{i=$F(f)}i=i.replace(/\r/g,"");if(!i.empty()&&this.last_msg!=i){this.uniqueSubmit("auto_save_draft");this.last_msg=i}}.bind(this),DIMP.conf_compose.auto_save_interval_val*60)}if(this.editor_on){d=FCKeditorAPI.GetInstance("message");d.SetHTML(g);this.last_msg=d.GetHTML().replace(/\r/g,"")}else{f.setValue(g);this.setCursorPosition(f);this.last_msg=$F(f).replace(/\r/g,"")}$("to").setValue(h.to);this.resizeto.resizeNeeded();if(h.cc){$("cc").setValue(h.cc);this.resizecc.resizeNeeded()}if(DIMP.conf_compose.cc){this.toggleCC("cc")}if(h.bcc){$("bcc").setValue(h.bcc);this.resizebcc.resizeNeeded()}if(c.id[6]){a=$F("bcc");if(a){a+=", "}$("bcc").setValue(a+c.id[6])}if(DIMP.conf_compose.bcc){this.toggleCC("bcc")}$("subject").setValue(h.subject);$("in_reply_to").setValue(h.in_reply_to);$("references").setValue(h.references);$("reply_type").setValue(h.replytype);Field.focus(b||"to");this.resizeMsgArea();if(DIMP.conf_compose.show_editor){if(!this.editor_on){this.toggleHtmlEditor(e||false)}if(b=="message"){this.focusEditor()}}},focusEditor:function(){try{FCKeditorAPI.GetInstance("message").Focus()}catch(a){this.focusEditor.bind(this).defer()}},addAttach:function(h,b,e,c){var d=new Element("SPAN").insert(b),g=new Element("DIV").insert(d).insert(" ["+e+"] ("+c+" KB) "),a=new Element("INPUT",{type:"button",atc_id:h,value:DIMP.text_compose.remove}),f=DimpCore.clickObserveHandler;g.insert(a);$("attach_list").insert(g);f({d:a,f:this.removeAttach.bind(this,[a.up()])});if(e!="application/octet-stream"){f({d:d.addClassName("attachName"),f:function(){view(DimpCore.addURLParam(DIMP.conf.URI_VIEW,{composeCache:$F("composeCache"),actionID:"compose_attach_preview",id:h}),$F("composeCache")+"|"+h)}})}this.resizeMsgArea()},removeAttach:function(b){var a=[];b.each(function(c){c=$(c);a.push(c.down("INPUT").readAttribute("atc_id"));DimpCore.addGC(c.childElements());c.remove()});DimpCore.doAction("DeleteAttach",{atc_indices:a,imp_compose:$F("composeCache")});this.resizeMsgArea()},resizeMsgArea:function(){var a,b,d=document.documentElement,c=$("message");if(!DimpCore.window_load){this.resizeMsgArea.bind(this).defer();return}if(this.editor_on){a=$("messageParent").select("iframe").last();if(a){a.setStyle({height:this.getMsgAreaHeight()+"px"})}else{this.resizeMsgArea.bind(this).defer()}return}this.mp_padding=$("messageParent").getHeight()-c.getHeight();if(!this.row_height){a=$(c.cloneNode(false)).writeAttribute({id:null,name:null}).setStyle({visibility:"hidden"});$(document.body).insert(a);a.writeAttribute("rows",1);this.row_height=a.getHeight();a.writeAttribute("rows",2);this.row_height=a.getHeight()-this.row_height;a.remove()}b=parseInt(this.getMsgAreaHeight()/this.row_height);c.writeAttribute({rows:b,disabled:false});if(d.scrollHeight-d.clientHeight){c.writeAttribute({rows:b-1})}$("composeloading").hide()},uploadAttachment:function(){var a=$("upload");$("submit_frame").observe("load",this.attachmentComplete.bind(this));this.uniqueSubmit("add_attachment");a.stopObserving("change").replace(new Element("DIV",{id:"upload_wait"}).insert(DIMP.text_compose.uploading+" "+$F(a)))},attachmentComplete:function(){var a=$("submit_frame"),b=a.contentDocument||a.contentWindow.document;a.stopObserving("load");DimpCore.doActionComplete({responseJSON:b.body.innerHTML.evalJSON(true)},this.uniqueSubmitCallback.bind(this))},toggleCC:function(a){$("send"+a).show();$("toggle"+a).up().hide()},setCursorPosition:function(b){var c,a;switch(DIMP.conf_compose.compose_cursor){case"top":c=0;$("message").setValue("\n"+$F("message"));break;case"bottom":c=$F("message").length;break;case"sig":c=$F("message").replace(/\r\n/g,"\n").lastIndexOf(this.get_identity($F("last_identity")).sig)-1;break;default:return}if(b.setSelectionRange){Field.focus(b);b.setSelectionRange(c,c)}else{if(b.createTextRange){a=b.createTextRange();a.collapse(true);a.moveStart("character",c);a.moveEnd("character",0);Field.select(a);a.scrollIntoView(true)}}},openAddressbook:function(){window.open(DIMP.conf_compose.abook_url,"contacts","toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,width=550,height=300,left=100,top=100")}},ResizeTextArea=Class.create({maxRows:5,initialize:function(c,b){this.field=$(c);this.defaultRows=Math.max(this.field.readAttribute("rows"),1);this.onResize=b;var a=this.resizeNeeded.bindAsEventListener(this);this.field.observe("mousedown",a).observe("keyup",a);this.resizeNeeded()},resizeNeeded:function(){var a=$F(this.field).split("\n"),c=this.field.readAttribute("cols"),b=a.size(),d=this.field.readAttribute("rows");a.each(function(e){if(e.length>=c){b+=Math.floor(e.length/c)}});if(b!=d){this.field.writeAttribute("rows",(b>d)?Math.min(b,this.maxRows):Math.max(this.defaultRows,b));if(this.onResize){this.onResize()}}}});document.observe("dom:loaded",function(){var b,a=DimpCompose,c=a.resizeMsgArea.bind(a),d=DimpCore.clickObserveHandler;a.resizeMsgArea();a.initializeSpellChecker();$("upload").observe("change",a.uploadAttachment.bind(a));a.resizeto=new ResizeTextArea("to",c);a.resizecc=new ResizeTextArea("cc",c);a.resizebcc=new ResizeTextArea("bcc",c);if(Prototype.Browser.WebKit){$("submit_frame").writeAttribute({position:"absolute",width:"1px",height:"1px"}).setStyle({left:"-999px"}).show()}if(b=$("compose_close")){d({d:b,f:a.confirmCancel.bind(a)})}d({d:$("send_button"),f:a.uniqueSubmit.bind(a,"send_message")});d({d:$("draft_button"),f:a.uniqueSubmit.bind(a,"save_draft")});["cc","bcc"].each(function(e){d({d:$("toggle"+e),f:a.toggleCC.bind(a,e)})});if(b=$("htmlcheckbox")){d({d:b,f:a.toggleHtmlCheckbox.bind(a),ns:true})}if(DIMP.conf_compose.abook_url){$("sendto","sendcc","sendbcc").each(function(e){d({d:e.down("TD.label SPAN").addClassName("composeAddrbook"),f:a.openAddressbook.bind(a)})})}$("compose").observe("submit",Event.stop);$("identity").observe("change",a.change_identity.bind(a));$("togglecc").observe("click",c);$("togglebcc").observe("click",c);Event.observe(window,"resize",c)});