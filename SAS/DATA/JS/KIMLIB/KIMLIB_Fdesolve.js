// let names = [
//             "f1","f2","f3","f4","f5","f6","f7","f8","f9","f10",
//             "f11","f12","f13","f14","f15","f16","f17","f18","f19","f20",
//             "f21","f22","f23","f24","f25","f26","f27","f28","f29","f30",
//             "f31","f32","f33","f34","f35","f36","f37","f38","f39","f40",
//             "f41","f42","f43","f44","f45","f46","f47","f48","f49","f50",
//             "f51","f52","f53","f54","f55","f56","f57","f58","f59","f60",
//             "f61","f62","f63","f64","f65","f66","f67","f68","f69","f70",
//             "f71","f72","f73","f74","f75","f76","f77","f78","f79","f80",
//             "f81","f82","f83","f84","f85","f86","f87","f88","f89","f90",
//             "f91","f92","f93","f94","f95","f96","f97","f98","f99","f100",
//         ];

// Define KIMLIB_Fdesolve
	class KIMLIB_Fdesolve{
		constructor(estParam,F){
			this.estParam = estParam;
			this.F = F;
			this.ested_F = [];
			this.cal();
			this.cal_BigEigenComposition_95();
		}
		cal(){
			var tt = new Date();
			let t = this;
			this.F.forEach(function(d,index){
				var newd={};
				for(let i=0;i<100;i++){
					let iname = "f"+(i+1);
					newd.date = d.date;
					newd[iname] = d[iname] * t.estParam[iname];
				}
				t.ested_F.push(newd);
			});
			console.log("KIMLIB_Fdesolve / cal :",new Date()-tt);
		}
		cal_minmaxY(DTs,F_names){
			this.subdata = KIM_Tools.slice_by_daterange(this.ested_F,DTs);

			let t = this;
			this.minmaxY = {};
			this.postHalf_minmaxY = {};

			this.dY = [];
			this.dY_detail = [];

			this.postHalf_dY = [];


			F_names.forEach((id,i)=>{
				let minmaxY = d3.extent(t.subdata.map(d=>{return d[id]}));
				t.minmaxY[id]=minmaxY;
				t.dY.push(minmaxY[1]-minmaxY[0]);
				t.dY_detail.push({
					id: id,
					max_dY: minmaxY[1]-minmaxY[0]
				});
			});
			let minmax_dY = d3.extent(this.dY);
			this.max_dY = minmax_dY[1] / 2;

			this.dY_detail
				.sort((a,b)=>{return d3.descending(a.max_dY, b.max_dY)});
					
			




			// this.postHalf_subdata = [];
			// for(var i=Math.floor(this.subdata.length/2);i<this.subdata.length;i++){
			// 	this.postHalf_subdata.push(this.subdata[i]);
			// }
			// F_names.forEach((id,i)=>{
			// 	let ids = "f"+(id+1);
			// 	let postHalf_minmaxY = d3.extent(t.postHalf_subdata.map(d=>{return d[id]}));
			// 	t.postHalf_minmaxY[id] = postHalf_minmaxY;
			// 	t.postHalf_dY.push(postHalf_minmaxY[1]-postHalf_minmaxY[0]) ;
			// });
		}
		cal_BigEigenComposition_95(){
			let t = this;

			let Param = [],eigenSum = 0;
			Object.keys(this.estParam).forEach((canme,i)=>{			
				if(canme == "date"){return}; 
				if(canme == "r"){return}; 
				let eigen = Math.abs(t.estParam[canme]);
				Param.push({id: canme,	value: eigen});
				eigenSum += eigen;
			});
			Param = Param.sort((a,b)=>{return d3.descending(Math.abs(a.value), Math.abs(b.value))});
			
			let bigList = this.bigList = [], smallList = [],cum = 0;
			Param.forEach(function(d){
				cum += d.value;
				if (cum > eigenSum*0.95){
					smallList.push(d.id); 
				}else{
					bigList.push(d.id); 
				}
			});

			let ested_big = t.ested_big = [];
			this.ested_F.forEach((d,index)=>{
				let newd={
					date: 		d.date,
					big_sum:  	t.estParam.r,
				};
				bigList.forEach((id,i)=>{newd.big_sum += d[id];});		
				ested_big.push(newd);
			});
		}
		give_bigEigenCompsition_target(tagetSVG){
			let t = this;

			tagetSVG.drawfcn.push(()=>{
				tagetSVG.line
				    .datum(KIM_Tools.slice_by_daterange(t.ested_big,tagetSVG.xScale.domain()))
				    .attr("d", d3.line()
						.x(d=> { return tagetSVG.xScale(d.date) })
						.y(d=> { return tagetSVG.yScale(d.big_sum) })
				    );	
			});

			tagetSVG.line
			    .datum(KIM_Tools.slice_by_daterange(t.ested_big,tagetSVG.xScale.domain()))
			    .attr("d", d3.line()
					.x(d=> { return tagetSVG.xScale(d.date) })
					.y(d=> { return tagetSVG.yScale(d.big_sum) })
			    );	
		}		
	}
// Define KIMGL_Fdesolvechart
	class KIMGL_FdesolveChart extends KIMGL_Simple{
		constructor(F,DorM,motherDOM,brushPad,shader){
	        let canvas = document.createElement("canvas");
	        canvas.style.position = "absolute";        
			super(canvas,shader);
			this.motherDOM = motherDOM;
	        this.motherDOM.appendChild(this.canvas);

			this.F = F;	
			this.DorM = DorM;	
			this.brushPad = brushPad;	
        	this.brushPad.pushchild(this);        

			this.SVGonCanvas = new SVG_for_FdesolveChart(this.motherDOM, this.canvas);
			this.SVGonCanvas.desolveChart = this;
			if(this.DorM === "M5"){
				this.SVGonCanvas.dateformat = '%Y-%m-%d %H:%M';
		        this.SVGonCanvas.dateformatlength = 100;			
			}
			this.drawfcn = [];
			this.post_drawfcn = [];
	        this.self_colors = [
	            0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x770000, 0x007700, 0x000077,
	        ];
	        this.ele = {};
	        this.F_colors = [];
			this.SVGonCanvas.glSide = this;
			this.F_names = [];
		}
		resize(x,y,w,h){
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.canvas.style.top = this.y + "px";
			this.canvas.style.left = this.x + "px";

			this.texturedata_width = Math.floor(this.canvas.width*this.ratio);
			this.texturedata_height = Math.floor(this.canvas.height*this.ratio);
			this.imageData = this.ctx.createImageData(this.texturedata_width, this.texturedata_height);

			this.texturedata = new Uint8Array(this.imageData.data.buffer);

			this.SVGonCanvas.resize();
			this.Draw();
		}		

		subDraw(){
			this.shader.useProgram('Program_2');
			this.F.cal_minmaxY(this.brushPad.DTs,this.F_names);

			this.subdata = this.F.subdata;
			this.minmaxY = this.F.minmaxY;
			this.dY = this.F.dY;
			this.max_dY = this.F.max_dY;

			this.postHalf_subdata = this.F.postHalf_subdata;
			this.postHalf_minmaxY = this.F.postHalf_minmaxY;			
			this.postHalf_dY = this.F.postHalf_dY;

			this.SVGonCanvas.dY_detail = this.F.dY_detail;

			let t = this;
			this.drawfcn.forEach( fcn => { fcn(t) });	
			this.post_drawfcn.forEach( fcn => { fcn(t) });			
		
			this.SVGonCanvas.set_ScaleDomain_var(this.brushPad.DTs, [-this.max_dY,this.max_dY]);
			this.SVGonCanvas.Draw();
		}

		pushLineChild(F_name,color,linewidth){
			this[F_name] = new tylineShape(this.F.ested_F, this.brushPad.sh_xScale, F_name, color, 1, 0.5);

			let t = this;
	        this.drawfcn.push(function(t){
	            t.drawLineChild(F_name,linewidth);   
	        }); 
			this.ele[F_name] = {
				type: "line",
				lineWidth: linewidth,
				c: '#' + ('00000' + (color | 0).toString(16)).substr(-6),
				color: color,
				id:F_name,
			};	
		}
		pushLineChilds(F_names){
			this.F_names = F_names;
			var t = this; 
			F_names.forEach(
				(F,i)=>{
					t.pushLineChild(F,t.self_colors[i % t.self_colors.length],0.5);
				}
			);
		}
		drawLineChild(F_name,width){
			let minmaxY = this.minmaxY[F_name];
			let mid =  (minmaxY[1]+minmaxY[0])/2, 
				wid = (minmaxY[1]-minmaxY[0])/2, 
				k = wid/this.max_dY;
			minmaxY = [mid-this.max_dY, mid+this.max_dY];
			minmaxY = [minmaxY[0], minmaxY[0]+this.max_dY*2];
			minmaxY = [ minmaxY[0]+this.max_dY*2,minmaxY[0]];
	        this[F_name].Draw(
	        	this.shader, this.brushPad.xS, minmaxY,
	        	this.canvas.width, this.canvas.height,
	        	1,width
	        ); 	
		}
	}

	class SVG_for_FdesolveChart extends SVG_for_Canvas{
		constructor(motherDOM,canvas){
			super(motherDOM,canvas);
			this.crosshair_DOM 	 = this.svg_DOM.append("g").attr("class","crosshair");
			this.dateformat = '%Y-%m-%d';
	        this.dateformatlength = 65;

	        this.xScale = techan.scale.financetime().range([0,this.canvas.width]);
	        this.line = this.svg_DOM.append("g")
	        	.append("path")
	        	.attr("fill", "none")
			    .attr("stroke", "steelblue")
			    .attr("stroke-width", 4);
			this.legend_DOM = this.svg_DOM.append("g");	
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
				// if ("MP" in t){
				// 	t.MP.moveTargetCircle(coord);
				// }			
			}
			this.grid_y_DOM.call(
				d3.axisLeft(this.yScale)
					.tickValues(KIM_Tools.getYticks_10(this.yScale.domain()))
					.tickSize(-this.canvas.width).tickFormat("")
			);
			this.grid_x_DOM.call(
				d3.axisBottom(this.xScale)
					.tickValues(KIMSVG_MonthGrid(this.xScale.domain()))
					.tickSize(-this.canvas.height).tickFormat("")
			);	

			let xy = [];
			this.dY_detail.forEach(function(d,i){
				if (i<10){
					xy.push({
						x: (t.canvas.width/11)*(i+1), 
						y: 10,
						c: t.glSide.ele[d.id].c,
						color:t.glSide.ele[d.id].color,
						id: d.id,
					});					
				}
			});
			this.legend_DOM
				.selectAll("circle")
				.remove();
			this.legend_DOM
				.selectAll("circle")
				.data(xy)
				.enter()
				.append("circle")
				  .attr("cx", d => d.x)
				  .attr("cy", d => d.y)
				  .attr("r", d => 5)
				  .style("fill", d => `${d.c}`)
				  .style("opacity", 0.9)
				  .on("click", function(d){
				  		t.glSide.post_drawfcn = [];
				        t.glSide.post_drawfcn.push(function(tt){
				            tt.drawLineChild(d.id,2.5);   
				        }); 
				  		t.glSide.Draw();
				  })
		}	

		mousewheel(){}			
	}

// Define	KIMGL_Fdesoler_help
	class KIMGL_Fdesoler_help extends KIMGL_Simple{
		constructor(Fdesoler,x,y,w,shader){
			let canvas = document.createElement("canvas");
	        canvas.style.position = "absolute";        
	        canvas.width = w;
	        canvas.height = w;
	        canvas.style.top = y + "px";
	        canvas.style.left = x + "px";
			super(canvas,shader);
			this.Fdesoler = Fdesoler;
			this.motherDOM = this.Fdesoler.motherDOM;
			this.canvas = canvas;
	        this.motherDOM.appendChild(this.canvas);
			this.SVGonCanvas = new SVG_for_Fdesoler_help(this.motherDOM, this.canvas);
			this.SVGonCanvas.Fdesoler = Fdesoler;
			this.Fdesoler.brushPad.pushchild(this);
			this.Draw();
		}
		subDraw(){
			let t = this;

			let xdata = this.Fdesoler.minmaxY;
			let ydata = this.Fdesoler.postHalf_minmaxY;
			this.F = this.SVGonCanvas.F = this.Fdesoler.F;


			let xy = this.SVGonCanvas.xy = [];			
			this.Fdesoler.F_names.forEach(function(index,i){
				xy.push({
					x: xdata[index][1] - xdata[index][0], 
					y: ydata[index][1] - ydata[index][0],
					c: t.Fdesoler.ele[index].c,
					color: t.Fdesoler.ele[index].color,
					id: index,
				});
			});
			this.SVGonCanvas.set_ScaleDomain_var(
				[0,this.Fdesoler.max_dY*2.1],
				[0,this.Fdesoler.max_dY*2.1]
			);
			this.SVGonCanvas.Draw();
		}
	}
	class SVG_for_Fdesoler_help extends SVG_for_Canvas{
		constructor(motherDOM,canvas){
			super(motherDOM,canvas);
			this.crosshair_DOM 	 = this.svg_DOM.append("g").attr("class","crosshair");
			this.data_DOM 	 = this.svg_DOM.append("g");	
    		var t = this;	
    		this.crosshair_DOM
    			.on("click",function(){
    				t.reRadio(t.xScale.invert(d3.mouse(this)[0]),t.yScale.invert(d3.mouse(this)[1]));
    			});
    		this.r = 10;
		}
		reRadio(x,y){
			this.r = Math.sqrt(x**2+y**2);
			this.Draw();
			// this.bigList = [];this.smallList = [];
			// this.xy.forEach(function(d,i){
			// 	let dr = Math.sqrt(d.x**2+d.y**2);
			// 	if(dr>t.r){ t.bigList.push(d.name);}
			// 		else{ t.smallList.push(d.name);}
			// });
			let t = this;
			t.Draw_line(t.Fdesoler.F.ested_big,t.tagetSVG,"big_sum");
			if ("tagetSVG" in this ){
				this.tagetSVG.drawfcn.push(()=>{
					t.Draw_line(t.Fdesoler.F.ested_big,t.tagetSVG,"big_sum");
				});
			}
		}
		Draw_line(data,tagetSVG,iname){
			tagetSVG.line
			    .datum(KIM_Tools.slice_by_daterange(data,tagetSVG.xScale.domain()))
			    .attr("d", d3.line()
					.x(d=> { return tagetSVG.xScale(d.date) })
					.y(d=> { return tagetSVG.yScale(d[iname]) })
			    );					
		}		


		Draw(){
			var t = this;

			this.data_DOM
				.selectAll("circle")
				.remove();
			this.data_DOM
				.selectAll("circle")
				.data(this.xy)
				.enter()
				.append("circle")
				  .attr("cx", d => this.xScale(d.x))
				  .attr("cy", d => this.yScale(d.y))
				  .attr("r", d => 4)
				  .style("fill", d => `${d.c}`)
				  .style("opacity", 0.9)
				  .on("click", function(d){
				  		t.Fdesoler.post_drawfcn = [];
				        t.Fdesoler.post_drawfcn.push(function(tt){
				            tt.drawLineChild(d.id,tt[d.id],new THREE.Color(d.color),2);   
				        }); 
				  		t.Fdesoler.Draw();
				  		console.log(d);
				  });


			this.crosshair_DOM.call(
				techan.plot.crosshair()			
		        	.xScale(this.xScale)
		        	.yScale(this.yScale)
		        	.xAnnotation(
		        		techan.plot.axisannotation()
					    	.axis(d3.axisBottom(this.xScale))
					    	.orient('bottom')
							.format(d3.format(',.2f'))
		    		)
		        	.yAnnotation(
		        		techan.plot.axisannotation()
							.axis(d3.axisLeft(this.yScale))
							.orient('right')
							.format(d3.format(',.2f'))
					).on("move", cursormove)
		    );


			function cursormove(coord){}		
			this.grid_y_DOM.call(
				d3.axisLeft(this.yScale)
					.tickValues(KIM_Tools.getYticks_10(this.yScale.domain()))
					.tickSize(-this.canvas.width).tickFormat("")
			);
			this.grid_x_DOM.call(
				d3.axisBottom(this.xScale)
					.tickValues(KIM_Tools.getYticks_10(this.xScale.domain()))
					.tickSize(-this.canvas.height).tickFormat("")
			);
		}	
	}