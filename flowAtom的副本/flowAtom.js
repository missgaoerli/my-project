/**
 * 原子流程配置js
 * @author gaoerli
 */
username=$.cookie("account");

//判断权限
function init_first() {
	//==============判断当前用户是否有操作权限=============
	var typeName = 'config';
	var authorityUrl = getServerUrl('getAuthorityForAccount');
	$('.content').hide();
	var param={};
    param['data'] = JSON.stringify({userName:username,typeName : typeName });
    param = getParam(param);
	$.post(authorityUrl, param, function(data){
		var data_json = $.parseJSON(data);
        // 判断返回的status200成功
        if(data_json.status!=200){
	        	alert("您没有配置权限!");
	        	return;
        }else {
       		 $('.content').show();
        	 	init();
        }
	})
}

//获取原子流程列表
function init(){
	
	// 得到请求地址	
	var listUrl = getServerUrl('getFlowAtomList');
	var param = {};
    param = getParam(param);
    $('#envTable').hide();//表格隐藏
	// post提交getFlowAtomList
	$.post(listUrl,param, function(data){
        //console.log(data);
        // 返回的Json转换
        var data_json = $.parseJSON(data);
//      console.log(data_json);
        // 判断返回的status200成功
        if(data_json.status==200){
        		$('#envTable').show();//表格显示
        	// 初始化操作选项
            var data=data_json.data,listHtml="";
            $.each(data,function(i,v){
////              console.log(v);
                listHtml+="<tr><td>"+v.name+"</td>" ;//原子流程名称
                
	        			if(v.haveExMethod == 1){
	        		 		listHtml+="<td>"+"是"+"</td>";	//是否有执行方法
	        			}else{
	                		 listHtml+="<td>"+"否"+"</td>";//是否有执行方法
	        			}
                		if(v.exMethod == null){
                			listHtml+="<td>"+''+"</td>"	;		//执行方法方式为null
                		}else{
                			listHtml+="<td>"+v.exMethod+"</td>"	;		//执行方法方式
                		}
                		if(v.method == null){			//执行方法为null
                			listHtml+="<td>"+''+"</td>"	;	
                		}else{
                			listHtml+="<td>"+v.method+"</td>";	//执行方法
                		}
//              			+"<td>"+v.method+"</td>"		//执行方法
        					listHtml+="<td >"+v.interfaceName+"</td>"		//执行接口
                			
						+"<td>"+v.detail+"</td>"	//描述
						+"<td>"		//操作
//						<a  class="btn btn-info btn-sm"   onclick="Apply();" id="sub">提交申请</a>
//		                		   <a href="javascript:void(0);" class="btn btn-info "  role="button" onclick="f()">申请</a>
						+"<a href='javascript:void(0);' class='btn btn-info btn-sm' style='margin-right:10px' role= 'button' onclick='getFlowAtomById("+v.id + ")'>编辑</a>"
//						+"<td ><a href='javascript:void(0);' class='btn btn-info btn-sm'>流程结果查看 </a></td>"
//						+"<td ><a href='javascript:void(0);' class='btn btn-info btn-sm' onclick='recyclePer("+v.id+","+v.envIpId+",\""+v.funcName+"\",\""+v.userName+"\",\""+v.recipients+"\",\""+v.multiTypeId+"\")'>回收</a></td >"

						+"<a href='javascript:void(0);' class='btn btn-info btn-sm'role= 'button' onclick='delFlowAtomById("+v.id +",\""+v.name+"\")'>删除</a></td ></tr>";
						
            })
            $('#flowAtomList').html(listHtml)
        } else {
        	alert(data_json.message);
        }
    })
}

/**
 * 删除原子流程
 * @param _id :原子流程id
 */
function delFlowAtomById(_id,_name){
    var message='确定删除原子流程<strong>'+_name+'</strong>?';
	$('#message').html(message);
	 $('.confirm_model').show()
	// 点击获取确认是事件
	$('#ok').off().on('click',function(){
		    $('.confirm_model').hide();//隐藏
	        var delMultiEnvTypeConfigUrl=getServerUrl('deleteFlowAtomById');
	        var param={};
            param["data"]=JSON.stringify({id:_id});
            param = getParam(param);
            $.post(delMultiEnvTypeConfigUrl,param,function(data){
            // 返回的Json转换
	            var data_json = $.parseJSON(data);
	            console.log(data_json);
	            // 判断返回的status200成功
	            if(data_json.status==200){
	                // 初始化操作选项
		            alert(data_json.message)
		            location.reload() 
	            } else {
	                alert(data_json.message);
	            }
	        })
    })
	$('#no').on('click',function(){
	    $('.confirm_model').hide();
	    return false;
	})
}

/**
 * 添加与更新流程配置
 * 
 */
function addFlowAtom(){
	//列表隐藏
	$('#envFlowAtomList').hide();
	clearAll();//初始化数据
	//配置页面显示
	$('#addOrUpFlowAtom').show();
}

//点击复选框触发事件
 $('#have_ex_method').on('click',function(){
 	if($('input[id="have_ex_method"]').prop("checked")) { // 选中
// 		$(".ex_method option[value='Jenkins']").attr("selected",true);
   		$('#method').val('');//方法置空
		$('.have_ex_methodFlag').show();//输入执行方法显示
	}else{
		//之前的数据置空
		$('#method').val('');
		$(".ex_method option[value='']").attr("selected",true);
		$('.have_ex_methodFlag').hide();//输入执行方法显示隐藏
	}
 })
 
//初始化数据
function clearAll(){
	$('#name').val('')//原子流程名称
	$('#method').val('');//方法
	$('#interface_name').val();//接口
	$('#atomdetail').val();//描述
	$('#flowAtomId').val(0)//id
//	$('input[id="have_ex_method"]').prop("")
}
//取消model
function closeModel(){
    $('#addOrUpFlowAtom').hide();
    $('#envFlowAtomList').show();
    location.reload();//并刷新
}

//添加提交
function Apply(){
	var _id = trim($('#flowAtomId').val());//默认id
	var names=trim($('#name').val());//原子流程名称
	var interface_name=trim($('#interface_name').val());//接口
	var details = trim($('#atomdetail').val());//描述
    var ex_method=$('.ex_method').val();//选的方式
    var method = trim($('#method').val());//执行的方法
//  var detail=$('#detail_name').val()
	var have_ex_method = 0;
	if($('input[id="have_ex_method"]').prop("checked")) { // 选中
		have_ex_method = 1;
		if(!names|| !method|| !ex_method|| !interface_name||!details){
			alert('配置项不能为空！')
            	return false;
		}
	}else{
		if(!names|| !interface_name||!details){
			alert('配置项不能为空！')
            	return false;
		}
	}
	
	Apply_sub(_id, names, have_ex_method, ex_method, method, interface_name, details);
}
//去左右空格;
 function trim(s){
      return s.replace(/(^\s*)|(\s*$)/g, "");
  }

//开始添加
function Apply_sub(_id, names, have_ex_method, ex_method, method, interface_name, details){
	var judgeParam = {};
	var judgeData = JSON.stringify({
		id: _id,name: names, haveExMethod:have_ex_method, exMethod:ex_method, method:method, interfaceName:interface_name, detail:details
	});
	judgeParam['data'] = judgeData;
	judgeParam = getParam(judgeParam);
	var addOrUpUrl = getServerUrl('addOrUpdateFlowAtom');
	
	$.post(addOrUpUrl,judgeParam,function(data){
    // 返回的Json转换
        var data_json = $.parseJSON(data);
        // 判断返回的status200成功
        console.log(data_json);
        if(data_json.status==200){
            // 初始化操作选项
            alert(data_json.message)
            location.reload() 
        } else {
            alert(data_json.message);
        }
    })
}

/**
 * 修改原子流程
 */
function getFlowAtomById(_id){
	addFlowAtom();//初始化数据，隐藏列表
	
	var getFlowAtomByIdUrl=getServerUrl('getFlowAtomById');
    var param={};
        param["data"]=JSON.stringify({id:_id});
         param = getParam(param);
        $.post(getFlowAtomByIdUrl,param,function(data){
	        // 返回的Json转换
	        var data_json = $.parseJSON(data);
	        console.log(data_json);
		    if(data_json.status==200){
		    		var data=data_json.data;
		    		$('#flowAtomId').val(data.id)//id
		    		$('#name').val(data.name)//原子流程名称
				
				$('#interface_name').val(data.interfaceName);//接口
				$('#atomdetail').val(data.detail);//描述
				if(data.haveExMethod == 1){
					$('input[id="have_ex_method"]').prop("checked",true)//复选框被选中
					
		//				$('#have_ex_method input:checkbox[value='']').attr('checked','true')
					$(".ex_method option[value='"+data.exMethod+"']").attr("selected",true);
					$('#method').val(data.method);//方法
					$('.have_ex_methodFlag').show();//输入执行方法显示
				}
		    }else {
	            alert(data_json.message);
	        }
        })
}

