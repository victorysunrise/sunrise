// For use written by KIM


	// var canvas = document.createElement("canvas");
	// 	document.body.appendChild(canvas);
	// 	canvas.width = OCHLCHART_width;
	//     canvas.height = OCHLCHART_height;
	// 	canvas.style.position = "absolute";
	//     canvas.style.top = 500+i*(OCHLCHART_height +20) + "px";
	//     canvas.style.left = 10+ "px";
 //    var sGL = new KIMGL_Candlechart(stocks[i],"DK",document.body,canvas,nDK_brush,Candlechartshader);
	// nDK_brush.pushchild(sGL);

// ------------------------------------------------------------------------


class KIMGL_Linechart extends KIMGL_Simple{
	constructor(F,DorM,motherDOM,canvas,brushPad,shader){
		super(canvas,shader);
		this.motherDOM = motherDOM;
		this.F = F;	
		this.DorM = DorM;	
		this.brushPad = brushPad;	
		this.SVGonCanvas = new SVG_for_Date_multiprice_Plane(this.motherDOM, this.canvas);
		if(this.DorM === "M5"){
			this.SVGonCanvas.dateformat = '%Y-%m-%d %H:%M';
	        this.SVGonCanvas.dateformatlength = 100;			
		}
		this.drawfcn = [];
	}
	subDraw(){
		this.shader.useProgram('Program_2');		
		this.subdata = KIM_Tools.slice_by_daterange(this.F[this.DorM],this.brushPad.DTs);
		var t = this;
		this.drawfcn.forEach(	
			function(fcn,index){
				fcn(t);
			}
		);
		this.SVGonCanvas.set_ScaleDomain_var(this.brushPad.DTs, [0,1]);
		this.SVGonCanvas.Draw();
	}

	pushLineChild(F_name,color,linewidth){
		this[F_name] = KIMGL_Linechart.makebuffer_LineWidth_wZ_wDatetime(this.F[this.DorM], this.brushPad.sh_xScale, F_name, 1);
		var t = this;
        this.drawfcn.push(function(t){
            t.drawLineChild(F_name,t[F_name],new THREE.Color(color),linewidth);   
        }); 
	}
	pushLineChilds(F_names,colors){
		if (typeof colors=="undefined"){
		    colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x770000, 0x007700, 0x000077];
		}
		var t = this; 
		F_names.forEach(
			function(F,i){
				t.pushLineChild(F,colors[i],0.3);
			}
		);
	}
	drawLineChild(F_name,bufferStruct,color,width){
		let minmaxY = d3.extent(this.subdata.map(function(d){if (d[F_name] !==0 ){return d[F_name]}}));
		
		let cam = this.ChangeSight(this.brushPad.xS, minmaxY);
		let gl = this.shader.gl;	
		this.setColor(color);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.buffer, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.DirBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.Dirbuffer, gl.STATIC_DRAW);

		var xr = cam.left*2/this.canvas.width;
		var yr = cam.top*2/this.canvas.height;
		var xyr = Math.min(xr,yr);
		gl.uniform1f(this.shader.xr, xr);
		gl.uniform1f(this.shader.yr, yr);
		gl.uniform1f(this.shader.d, width*xyr);

		gl.drawArrays(gl.TRIANGLES, 0, bufferStruct.Count*6); 	
	}

	static makebuffer_LineWidth_wZ_wDatetime(data, xScale, yname, z){
		var xyArray=[], DirArray=[], Count=0, pred = data[0];
		for ( var d of data){
			if (d[yname]!== 0 && pred[yname]!== 0){
				Count++;
				var onepiece = KIMGL_SAchart.fcn_onepieceRect(xScale(pred.date),pred[yname],xScale(d.date),d[yname],z);
				xyArray.push(...onepiece.Vertex);
				DirArray.push(...onepiece.Dir);					
			}
	
			pred = d;
		}
		return {
				Count: 			Count,
				buffer: 		new Float32Array(xyArray),
				Dirbuffer: 		new Float32Array(DirArray), 
		}
	}
}



class SVG_for_Date_multiprice_Plane extends SVG_for_Canvas{
	constructor(motherDOM,canvas){
		super(motherDOM,canvas);
		this.crosshair_DOM 	 = this.svg_DOM.append("g").attr("class","crosshair");
		this.dateformat = '%Y-%m-%d';
        this.dateformatlength = 65;

        this.xScale = techan.scale.financetime().range([0,this.canvas.width]);
	}

	Draw(){
		var t = this;
		this.crosshair_DOM.call(
			techan.plot.crosshair()			
	        	.xScale(this.xScale)
	        	.yScale(this.yScale)
	        	.xAnnotation(
	        		techan.plot.axisannotation()
				    	.axis(d3.axisBottom(this.xScale))
				    	.orient('bottom')
				    	.format(d3.timeFormat(this.dateformat))
				    	.width(this.dateformatlength)
	    		)
	        	.yAnnotation(
	        		techan.plot.axisannotation()
						.axis(d3.axisLeft(this.yScale))
						.orient('right')
						.format(d3.format(',.2f'))
				).on("move", cursormove)
	    );

		function cursormove(coord){
			if ("MP" in t){
				t.MP.moveTargetCircle(coord);
			}			
		}
		this.grid_x_DOM.call(
			d3.axisBottom(this.xScale)
				.tickValues(KIMSVG_MonthGrid(this.xScale.domain()))
				.tickSize(-this.canvas.height).tickFormat("")
		);
	}
	mousewheel(){
		console.log("ddd",d3.event.wheelDelta);
        var direction = d3.event.wheelDelta < 0 ? 'down' : 'up';
        zoom(direction === 'up' ? d : d.parent);
	}
			
}