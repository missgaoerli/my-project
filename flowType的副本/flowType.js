/**
 * 流程配置js
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

//得到操作类型列表
function init(){
	var paramData = {};
//	paramData['data'] = JSON.stringify({});''
	paramData = getParam(paramData);
	var multiTypeUrl=getServerUrl('getOperationTypeList');

    $.post(multiTypeUrl, paramData, function(data){
       // 返回的Json转换
       var data_json = $.parseJSON(data);
       // 判断返回的status200成功
       if(data_json.status==200){
           // 初始化操作选项
           var data=data_json.data,funcHtml="<option value ='null' data-id=0>请选择</option>";
           $.each(data,function(i,v){
//             console.log(data_json);
               funcHtml+="<option value ="+v.name+" data-id="+v.id+" >"+v.detail+"</option>";
           })
          $('#opTypeList').html(funcHtml);
          $('#op_type').html(funcHtml)
       }
    })
    var optype = null;
    getflowTypeList(optype);//获取默认的流程列表
    flowAtoms()// 得到原子流程表信息，并返回
    
}

/**
 * 获取流程列表
 */
function getflowTypeList(_opType){
	
	// 得到请求地址	
	var listUrl = getServerUrl('getFlowTypeList');
	var param = {};
	param['data'] = JSON.stringify({opType:_opType});
	param = getParam(param);
	// post提交
	$.post(listUrl, param, function(data){
        // 返回的Json转换
        var data_json = $.parseJSON(data);
//      console.log(data_json);
        // 判断返回的status200成功
        if(data_json.status==200){
            var data=data_json.data,listHtml="";
            $.each(data,function(i,v){
//              console.log(v);
                listHtml+="<tr><td>"+v.name+"</td>"
                			+"<td>"+v.detail+"</td>"
                			+"<td>"+v.operationType.detail+"</td>"
						+"<td>"+new Date(v.createTime).toLocaleString()+"</td>"
						+"<td>"+v.account+"</td>"
						+"<td>"
		               	+"<a href='javascript:void(0);' class='btn btn-info btn-sm' style='margin-right:10px' role= 'button' onclick='getFlowTypeById("+v.id + ")'>编辑</a>"

						+"<a href='javascript:void(0);' class='btn btn-info btn-sm'role= 'button' onclick='delFlowTypeById("+v.id+",\""+v.name+"\")'>删除</a></td ></tr>";
						
            })
            $('#flowTypeList').html(listHtml)
        } else {
        		$('#envTable').hide();
        		alert(data_json.message);
        }
    })

	//设置时间输出格式
    Date.prototype.toLocaleString = function() {
          return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + " " + addZero(this.getHours()) + ":" + addZero(this.getMinutes()) + ":" + addZero(this.getSeconds());
    };

    function addZero(num){
		if(num<10){
			return '0'+num;
		}else{
			return num;
		}
    }
}

//去左右空格;
 function trim(s){
      return s.replace(/(^\s*)|(\s*$)/g, "");
  }
 
/**
 * 得到原子流程列表
 */
function flowAtoms(){
	//请求接口
	var listUrl = getServerUrl('getFlowAtomList');
	var param = {};
    param = getParam(param);
    $.ajaxSettings.async = false;
    newlist="<option value =0 >请选择</option>";
	$.post(listUrl,param, function(data){
        // 返回的Json转换
        var data_json = $.parseJSON(data);
//      console.log(data_json);
        // 判断返回的status200成功
        if(data_json.status==200){
        		// 初始化操作选项
	          var data=data_json.data;
	          var funcHtml="<option value =0  data-name='' >请选择</option>";
	           $.each(data,function(i,v){
	//             console.log(data_json);
	               funcHtml+="<option value ="+v.id+"  data-name="+v.name+"  >"+v.name+"</option>";
	           })
	           newlist = funcHtml;
//	          $('#atoms_'+len).html(funcHtml);
        	} else {
        		alert(data_json.message);
        }
    })
	return newlist;
}

//选择执行类型触发事件筛选列表
$('#opTypeList').on('change',function(){
	var val =  $('#opTypeList').val(); //执行类型下拉框
//	alert(val);
	if(val != null){
		getflowTypeList(val);
	}
})

//删除流程类型
function delFlowTypeById(_id,_names){
	var message='确定删除流程类型<strong>'+_names+"</strong>?";
	$('#message').html(message);
	 $('.confirm_model').show()
	// 点击获取确认是事件
	$('#ok').off().on('click',function(){
		    $('.confirm_model').hide();//隐藏
	        var delMultiEnvTypeConfigUrl=getServerUrl('deleteFlowType');
	        var param={};
            param["data"]=JSON.stringify({flowTypeId:_id});
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
 * 添加流程类型
 */
function addFlowType(){
	//列表隐藏
	$('#envFlowAtomList').hide();
	clearAll();//初始化数据
	//配置页面显示
	$('#addOrUpFlowType').show();
	
}

//取消
function closeModel(){
	location.reload();
	//列表隐藏
//	$('#envFlowAtomList').show();
//	//配置页面显示
//	$('#addOrUpFlowType').hide();
}

//初始化数据
function clearAll(){		
	len = 1;//初始化标志
	$('#flowTypeId').val(0);	//流程类型id
	$('#flowType_name').val('');//流程名称
	$('#flowType_detail').val('');//流程描述
	
}

//点击添加流程addflow_step，渲染页面
function addflow_step(){
	
    var stepDivs=$('.step'); 
    var stepHtml="<div class='step' id=0><div class = 'col-md-4'></div>"
                        +"<label style='font-weight:normal;'>执行顺序:</label>"
                        +"<input type='text' class='step_detail' placeholder='请输入执行顺序' style='width:150px;margin: 0px 20px 10px 10px;'/>"
                        +"<label style='font-weight:normal;'>执行步骤名称:</label>"
                        	+"<select class='flow_atoms' id=atoms_"+len+"  style='width:180px;right;margin: 0px 20px 10px 10px;'><option value =0>请选择</option></select>"
                       	+"<button  onclick='deleThis(this);' style= 'margin: 0px 20px 10px 10px;padding: 4px 8px;' class='btn btn-info btn-sm' >删除</button>"
                       	+"</div>"
    $('.flows').append(stepHtml)
	var html=newlist;//数据库的值
	$('#atoms_'+len).html(html);
	len++;
//  console.log(html);
}



//点击删除渲染
function deleThis(is){
	var typeId = $(is).parent().attr('id'); //项目类型id
	//删除页面渲染
	if(typeId != 0){		//id不为空时，调用删除接口
		deleteFlowStepById(typeId);
	}
	$(is).parent().remove();	  //删除页面渲染
}

//删除流程数据
function deleteFlowStepById(_step_id){
 	var dellowStepUrl=getServerUrl('deleteFlowStepById');
    var param={};
    param["data"]=JSON.stringify({flowStepId:_step_id});
    param = getParam(param);
    $.post(dellowStepUrl,param,function(data){
    // 返回的Json转换
        var data_json = $.parseJSON(data);
        console.log(data_json);
        // 判断返回的status200成功
        if(data_json.status==200){
            // 初始化操作选项
            alert(data_json.message)
//          location.reload() 
        } else {
            alert(data_json.message);
        }
    })
	
}

//修改流程列表
function getFlowTypeById(_id){
	addFlowType();//初始化数据
	var getFlowTypeByIdUrl=getServerUrl('getFlowTypeById');
    var param={};
        param["data"]=JSON.stringify({id:_id});
         param = getParam(param);
        $.post(getFlowTypeByIdUrl,param,function(data){
	        // 返回的Json转换
	        var data_json = $.parseJSON(data);
	        console.log(data_json);
		    if(data_json.status==200){
		    		var datas = data_json.data;
		    		$('#flowTypeId').val(datas.id);	//流程类型id
				$('#flowType_name').val(datas.name);//流程名称
				$('#flowType_detail').val(datas.detail);//流程描述
		    		$("#op_type option[data-id='"+datas.opTypeId+"']").attr("selected",true); //流程执行类型选中
		    		
//		    		len = datas.flowStepList.length;
		    		var stepList = datas.flowStepList;
		    		var itemHtml = "";
		    		//渲染流程过程
		    		 $.each(stepList,function(i,v){
	                    itemHtml+="<div class='step' id="+v.id+"><div class = 'col-md-4'></div>"
	                    +"<label style='font-weight:normal;'>执行顺序:</label>"
	                    +"<input type='text' class='step_detail' value="+v.step+" style='width:150px;margin: 0px 20px 10px 10px;'/>"
	                    +"<label style='font-weight:normal;'>执行步骤名称:</label>"
	                    	+"<select class='flow_atoms' id=atoms_"+len+"  style='width:180px;right;margin: 0px 20px 10px 10px;'><option value =0>请选择</option></select>"
                       	+"<button  onclick='deleThis(this);' style= 'margin: 0px 20px 10px 10px;padding: 4px 8px;' class='btn btn-info btn-sm' >删除</button>"
                       	+"</div>"
                       	len ++;
	                })
	                $('.flows').html(itemHtml);
				for(var i= 1 ; i<datas.flowStepList.length+1;i++){
					$('#atoms_'+i).html(newlist);
				}
				
		    		$.each(stepList,function(i,v){
			        $('.flows .flow_atoms').eq(i).val(v.flowAtomId)
			    })
		    		
		    		
		    }else {
	            alert(data_json.message);
	        }
		})
}

/*
 * 添加数据
 */
function Apply(){
	var _id = trim($('#flowTypeId').val());//默认id=0
	var name = trim($('#flowType_name').val());//名称
	var detail = trim($('#flowType_detail').val());//描述
	var op_type = $('#op_type').val();//执行类型选中的名称，
	var op_typeId=$("#op_type option[value='"+op_type+"']").data('id'); 
	if(!name || !detail || !op_typeId){
		alert('配置项不能为空');
		return false;
	}
	var step_arr= []; //流程过程
	var stepDivs= $('.step');

	//循环得到添加流程
	stepDivs.each(function(i,v){
		var obj = {};
		obj.Step = $(v).children('.step_detail').val(); //顺序
		var atomId = $(v).children('.flow_atoms').val();
		obj.detail = $(".flow_atoms option[value='"+atomId+"']").data('name'); //下拉数据
			step_arr.push(obj); //流程信息
//			alert($(v).attr('id'));
	})
		
	if(step_arr.length == 0 ){
		alert('请添加流程过程');
		return false;
	}
	for(var x = 0 ;x<step_arr.length;x++){
		if(!step_arr[x].Step || !step_arr[x].detail){
			alert('请完善流程过程！');
    			return false;
		}
	}
	Apply_sub(_id, name, detail, op_typeId);		

}

/**
 * 开始添加
 * @param : _id:添加时为0
 * @param : name :流程类型名称
 * @param : detail: 描述
 * @param : op_typeId: 选中的执行流程
 * 
 */
function Apply_sub(_id, name, detail, op_typeId){
	var Param = {};
	Param['data'] = JSON.stringify({
		id: _id,name: name, detail:detail,opTypeId:op_typeId,account:username
	});
	Param = getParam(Param);
	var addFlowTypeUrl = getServerUrl('addOrUpdateFlowType');
	$.post(addFlowTypeUrl,Param,function(data){
    // 返回的Json转换
        var data_json = $.parseJSON(data);
        
        if(data_json.status==200){
        	
        		alert(data_json.message);//弹出提示信息
            location.reload();
            
            addFlowStep(data_json.data);//添加step信息
			
        } else {
            alert(data_json.message);
        }
        
      })
}

//添加step信息
function addFlowStep(flowId){
	
	var flow_id = flowId;//flowId
	var stepDates = [];
	var stepDivs= $('.step');

	//循环得到添加流程
	stepDivs.each(function(i,v){
		var obj = {};
		obj.id = $(v).attr('id');//id 默认id为0
		obj.flowId= flow_id;//flowId
		
		var atomId = $(v).children('.flow_atoms').val();
		
		obj.flowAtomId = atomId; //flowAtomId
		obj.step = $(v).children('.step_detail').val(); //顺序
		obj.detail = $(".flow_atoms option[value='"+atomId+"']").data('name'); //下拉数据，描述
		
		stepDates.push(obj); //流程信息
	})
	
	var step_param={};
    var step_data=JSON.stringify(stepDates);
    	step_data=step_data.replace(/\\"/g,"\""); // 替换所有的"/""为双引号
    	step_data=step_data.replace(/\"\[/g,"\["); 	
    	step_data=step_data.replace(/\]\"/g,"\]");
        step_param['data']=step_data;
        step_param = getParam(step_param);
    var addOrUpdateFlowStepUrl=getServerUrl('addOrUpdateFlowStep');
    
     $.post(addOrUpdateFlowStepUrl,step_param, function(data){
        var data_json = $.parseJSON(data);
         if(data_json.status==200){
//			console.log(data_json);
         }else{
            console.log(data_json.message);
         }
    })
	
	
}
