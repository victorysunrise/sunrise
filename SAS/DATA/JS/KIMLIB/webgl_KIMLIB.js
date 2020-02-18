// Define some vertice buffer making function for KIMGL 



	function KIMGL_MonthGrid_withZ(dates,xScale,z){
		let tickvalues = [], lasttick=-1, LineTexels = [];
		dates.forEach(function(item,index){
			if (lasttick != item.getMonth()) {
				lasttick = item.getMonth();	
				tickvalues.push(xScale(item));
			}
		});
		for ( var xd of tickvalues){
			LineTexels.push(...[xd-0.5,-1000,z, xd-0.5,1000,z]);
		}
		return {
			Count: tickvalues.length,
			Texels: new Float32Array(LineTexels)
		}
	}

	function KIMSVG_MonthGrid(dates){
		let tickvalues = [], lasttick=-1, LineTexels = [];
		dates.forEach(function(item,index){
			if (lasttick != item.getMonth()) {
				lasttick = item.getMonth();	
				tickvalues.push(item);
			}
		});
		return tickvalues;
	}


	function KIMGL_DayGrid_withZ(dates,xScale,z){
		let tickvalues = [], lasttick=-1, LineTexels = [];
		dates.forEach(function(item,index){
			if (lasttick != item.getDate()) {
				lasttick = item.getDate();	
				tickvalues.push(xScale(item));
			}
		});
		for ( var xd of tickvalues){
			LineTexels.push(...[xd-0.5,-1000,z, xd-0.5,1000,z]);
		}
		return {
			Count: tickvalues.length,
			Texels: new Float32Array(LineTexels)
		}
	}

// Define - glPrograms & Shader
	const KIMGL_ProgramScript = {
		Program_1:{
			V: 
				'attribute vec4 a_Position;\n' +
				'uniform mat4 u_ModelViewMatrix;\n' +
				'void main() {\n' +
				' 	vec4 p = a_Position;\n' +
				' 	gl_Position = u_ModelViewMatrix * p;\n' +	
				'}\n',
			F: 
				'precision mediump float;\n' +
				'uniform vec4 u_FragColor;\n' + 
				'void main() {\n' +
				' 	gl_FragColor = u_FragColor;\n' +
				'}\n',		
		},
		Program_2:{
			V: 
				'attribute vec4 a_Position;\n' +
				'attribute vec2 a_Dir;\n' +
				'uniform mat4 u_ModelViewMatrix;\n' +
				'uniform float xr;\n' +
				'uniform float yr;\n' +
				'uniform float d;\n' +

				'void main() {\n' +
				'   float r = yr/xr;\n' +
				'   float alpha = atan(a_Dir.g/a_Dir.r);\n' +
				'   float al = (1.0/sqrt(cos(alpha)*cos(alpha)+sin(alpha)*r*sin(alpha)*r))*d;\n' +

				' 	vec4 p = a_Position + vec4(a_Dir.r/r*al, a_Dir.g*r*al, 0.0, 0.0);\n' +	
				' 	gl_Position = u_ModelViewMatrix * p;\n' +
				'}\n',
			F: 
				'precision mediump float;\n' +
				'uniform vec4 u_FragColor;\n' + 
				'void main() {\n' +
				' 	gl_FragColor = u_FragColor;\n' +
				'}\n',		
		},
		Program_3:{
			V: 
				'attribute vec4 a_Position;\n' +
				'attribute vec2 a_Dir;\n' +
				'uniform mat4 u_ModelViewMatrix;\n' +
				'uniform float d;\n' +
				'void main() {\n' +
				' 	vec4 p = a_Position + vec4(a_Dir.r*d, a_Dir.g*d, 0.0, 0.0);\n' +	
				' 	gl_Position = u_ModelViewMatrix * p;\n' +
				'}\n',
			F: 
				'precision mediump float;\n' +
				'uniform vec4 u_FragColor;\n' + 
				'void main() {\n' +
				' 	gl_FragColor = u_FragColor;\n' +
				'}\n',		
		},
		Program_4:{
			V: 
				'attribute vec4 a_Position;\n' +
				'attribute vec2 a_Dir;\n' +
				'uniform mat4 u_ModelViewMatrix;\n' +
				'uniform float xr;\n' +
				'uniform float yr;\n' +
				'uniform float d;\n' +
				'uniform float mid;\n' +

				'void main() {\n' +
				'   float r = yr/xr;\n' +
				'   float alpha = atan(a_Dir.g/a_Dir.r);\n' +
				'   float al = (1.0/sqrt(cos(alpha)*cos(alpha)+sin(alpha)*r*sin(alpha)*r))*d;\n' +
				' 	vec4 p = a_Position + vec4(a_Dir.r/r*al, a_Dir.g*r*al, 0.0, 0.0) + vec4(0.0, -mid, 0.0, 0.0);\n' +	
				' 	gl_Position = u_ModelViewMatrix * p;\n' +
				'}\n',
			F: 
				'precision mediump float;\n' +
				'uniform vec4 u_FragColor;\n' + 
				'void main() {\n' +
				' 	gl_FragColor = u_FragColor;\n' +
				'}\n',		
		},


	}
	class glProgram{		
		constructor(gl, program){
			this.gl = gl;
		    this.program = createProgram(this.gl, program.V, program.F);
		    if (!this.program) {console.log('failed to create program');return false;}
		    this.gl.useProgram(this.program);
		}
		useProgram(shader){
			shader.nowProgram = this;
			this.gl.useProgram(this.program);
			this.gl.program = this.program;
			this.useProgram_post(shader);
		}	
		setVertex(buffer){
			this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer, this.gl.STATIC_DRAW);		
		}
		setColor(c){
			let color = new THREE.Color(c);
			this.gl.uniform4f(this.u_FragColor, color.r, color.g, color.b, 1.0);		
		}
		setMPV(mvp){	
			this.gl.uniformMatrix4fv(this.u_ModelViewMatrix, false, mvp);	
		}
		ChangeSight(xDomain,yDomain){
	        var cam = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 10000);  
			let dx = (xDomain[1]-xDomain[0])/2, 
				dy = (yDomain[1]-yDomain[0])/2, 
				mx = (xDomain[1]+xDomain[0])/2, 
				my = (yDomain[1]+yDomain[0])/2;
			cam.left = dx;	cam.right = -dx;
			cam.top = -dy;	cam.bottom = dy;
			
			cam.position.set(mx, my, -10);
			cam.lookAt(new THREE.Vector3(mx, my, 0));
			cam.zoom = 1;
			cam.updateProjectionMatrix();

	        cam.projectionMatrix.multiply(
	        	new Matrix4()
	        	.setLookAt(
	        		cam.position.x, cam.position.y, -1, 
	        		cam.position.x, cam.position.y,  0, 
	        		0, 1, 0
	        	)
	        );  
	        this.setMPV(cam.projectionMatrix.elements);
	        return cam;
		}
	}
	class glProgram_1 extends glProgram{
		constructor(gl){
			super(gl, KIMGL_ProgramScript.Program_1);
			this.name = 'Program_1';
		}
		useProgram_post(shader){
			this.vertexBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

			this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');	
			this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(this.a_Position);

			this.u_FragColor = this.gl.getUniformLocation(this.gl.program, 'u_FragColor');
			this.u_ModelViewMatrix = this.gl.getUniformLocation(this.gl.program,'u_ModelViewMatrix');

			shader.vertexBuffer = this.vertexBuffer;
			shader.a_Position  = this.a_Position;
			shader.u_FragColor = this.u_FragColor;
			shader.u_ModelViewMatrix = this.u_ModelViewMatrix;		
		}
	}
	class glProgram_2 extends glProgram{
		constructor(gl){
			super(gl, KIMGL_ProgramScript.Program_2);
			this.name = 'Program_2';		
		}
		useProgram_post(shader){
			this.vertexBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

			this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');	
			this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(this.a_Position);

			this.u_FragColor = this.gl.getUniformLocation(this.gl.program, 'u_FragColor');
			this.u_ModelViewMatrix = this.gl.getUniformLocation(this.gl.program,'u_ModelViewMatrix');

			shader.vertexBuffer = this.vertexBuffer;
			shader.a_Position  = this.a_Position;
			shader.u_FragColor = this.u_FragColor;
			shader.u_ModelViewMatrix = this.u_ModelViewMatrix;

			this.DirBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.DirBuffer);

			this.a_Dir = this.gl.getAttribLocation(this.gl.program, 'a_Dir');
			this.gl.vertexAttribPointer(this.a_Dir, 2, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(this.a_Dir);		

			this.xr = this.gl.getUniformLocation(this.gl.program, 'xr');
			this.yr = this.gl.getUniformLocation(this.gl.program, 'yr');

			this.d = this.gl.getUniformLocation(this.gl.program, 'd');

			shader.DirBuffer = this.DirBuffer;
			shader.a_Dir  = this.a_Dir;
			shader.xr = this.xr;
			shader.yr = this.yr;
			shader.d = this.d;		
		}
	}
	// class glProgram_3 extends glProgram{
	// 	constructor(gl){
	// 		super(gl,KIMGL_ProgramScript.Program_3);
	// 		this.name = 'Program_3';
	// 	}
	// 	useProgram_post(shader){
	// 		this.vertexBuffer = this.gl.createBuffer();
	// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

	// 		this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');	
	// 		this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
	// 		this.gl.enableVertexAttribArray(this.a_Position);

	// 		this.u_FragColor = this.gl.getUniformLocation(this.gl.program, 'u_FragColor');
	// 		this.u_ModelViewMatrix = this.gl.getUniformLocation(this.gl.program,'u_ModelViewMatrix');

	// 		shader.vertexBuffer = this.vertexBuffer;
	// 		shader.a_Position  = this.a_Position;
	// 		shader.u_FragColor = this.u_FragColor;
	// 		shader.u_ModelViewMatrix = this.u_ModelViewMatrix;

	// 		this.DirBuffer = this.gl.createBuffer();
	// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.DirBuffer);

	// 		this.a_Dir = this.gl.getAttribLocation(this.gl.program, 'a_Dir');
	// 		this.gl.vertexAttribPointer(this.a_Dir, 2, this.gl.FLOAT, false, 0, 0);
	// 		this.gl.enableVertexAttribArray(this.a_Dir);		

	// 		this.d = this.gl.getUniformLocation(this.gl.program, 'd');

	// 		shader.DirBuffer = this.DirBuffer;
	// 		shader.a_Dir  = this.a_Dir;
	// 		shader.d = this.d;		
	// 	}
	// }
	// class glProgram_4 extends glProgram{
	// 	constructor(gl){
	// 		super(gl,KIMGL_ProgramScript.Program_4);
	// 		this.name = 'Program_4';
	// 	}
	// 	useProgram_post(shader){
	// 		this.vertexBuffer = this.gl.createBuffer();
	// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

	// 		this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');	
	// 		this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
	// 		this.gl.enableVertexAttribArray(this.a_Position);

	// 		this.u_FragColor = this.gl.getUniformLocation(this.gl.program, 'u_FragColor');
	// 		this.u_ModelViewMatrix = this.gl.getUniformLocation(this.gl.program,'u_ModelViewMatrix');

	// 		shader.vertexBuffer = this.vertexBuffer;
	// 		shader.a_Position  = this.a_Position;
	// 		shader.u_FragColor = this.u_FragColor;
	// 		shader.u_ModelViewMatrix = this.u_ModelViewMatrix;

	// 		this.DirBuffer = this.gl.createBuffer();
	// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.DirBuffer);

	// 		this.a_Dir = this.gl.getAttribLocation(this.gl.program, 'a_Dir');
	// 		this.gl.vertexAttribPointer(this.a_Dir, 2, this.gl.FLOAT, false, 0, 0);
	// 		this.gl.enableVertexAttribArray(this.a_Dir);		

	// 		this.xr = this.gl.getUniformLocation(this.gl.program, 'xr');
	// 		this.yr = this.gl.getUniformLocation(this.gl.program, 'yr');

	// 		this.d = this.gl.getUniformLocation(this.gl.program, 'd');
	// 		this.mid = this.gl.getUniformLocation(this.gl.program, 'mid');

	// 		shader.DirBuffer = this.DirBuffer;
	// 		shader.a_Dir  = this.a_Dir;
	// 		shader.xr = this.xr;
	// 		shader.yr = this.yr;
	// 		shader.d = this.d;	
	// 		shader.mid = this.mid;			
	// 	}
	// }

	class Shaders{
		constructor(){
			this.hiddencanvas = document.createElement("canvas");
			this.gl = this.hiddencanvas.getContext("webgl");
			this.createVF();

			this.targetTexture = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
			const level = 0;const border = 0;
			this.fb = this.gl.createFramebuffer();
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.targetTexture, level);
		}
		Resize(w,h){
			this.VF_Program_1.useProgram(this);
			if (this.width == w && this.height == h) return;
			this.width = w;
			this.height = h;		
			const level = 0;const border = 0;
			this.gl.texImage2D(this.gl.TEXTURE_2D, level, this.gl.RGBA, w, h, border, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);		
			this.gl.viewport(0, 0, w, h);
		}
		createVF(){
			this.createVF_Program_1();
			this.createVF_Program_2();
		}
		createVF_Program_1(){
			this.VF_Program_1 = new glProgram_1(this.gl);
			this.VF_Program_1.useProgram(this);
		}
		createVF_Program_2(){
			this.VF_Program_2 = new glProgram_2(this.gl);
			this.VF_Program_2.useProgram(this);
		}

		useProgram(programName){
			if(this.nowProgram.name == programName){
				return;
			}
			if(this.VF_Program_1.name == programName){
				this.VF_Program_1.useProgram(this); 
				return;				
			}
			if(this.VF_Program_2.name == programName){
				this.VF_Program_2.useProgram(this);
				return;				
			}
		}
		CopyImage(targetbuffer){
			this.gl.readPixels(
				0, 0, this.width, this.height, 
				this.gl.RGBA, this.gl.UNSIGNED_BYTE, targetbuffer
			);
		}
	}

class KIMGL_Simple{
	constructor(canvas,shader){
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.ratio = 1;
		this.texturedata_width = Math.floor(this.canvas.width*this.ratio);
		this.texturedata_height = Math.floor(this.canvas.height*this.ratio);
		this.imageData = this.ctx.createImageData(this.texturedata_width, this.texturedata_height);

		this.texturedata = new Uint8Array(this.imageData.data.buffer);
		this.shader = shader;
	}

	glclear(){
		let gl = this.shader.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);			
	}	

	Draw(){
		// let tt = new Date();
		this.shader.Resize(this.texturedata_width,this.texturedata_height);
		this.glclear();
		this.subDraw();

		this.shader.CopyImage(this.texturedata);
		var t = this;
		createImageBitmap(t.imageData)
			.then(function(imgBitmap) {
				t.ctx.drawImage(
					imgBitmap
						,0,0,	t.texturedata_width,	t.texturedata_height
						,0,0,	t.canvas.width,	t.canvas.height
				);
			});
		// console.log("Draw : ", new Date()-tt);
	}
	subDraw(){}
	ChangeSight(xS,yS){
		return this.shader.nowProgram.ChangeSight(xS,yS);
	}
	setColor(c){
		this.shader.nowProgram.setColor(c);
	}
}

// Define shapeType
	class shapeType{
		constructor(data){
			this.data = data;
		}
		reShape(data){
			if (data.length==0){
				this.buffer = this.initbuffer;
				return;
			}
			let addbuffer = this.glBuffer(data);
			this.buffer = KIM_Tools.Merge2glBuffer(this.initbuffer,addbuffer);
		}		
		glBuffer(){
			console.log("This Class glBuffer() function must be refined!");
		}
	} 

	class candleShape extends shapeType{
		constructor(data,xScale){
			super(data);
			this.data = data;
			this.xScale = xScale;
			this.initbuffer = this.glBuffer(this.data);
			this.reShape([]);
		}
		static BodyArr(lo,hi,x,z){
			let l=x-0.4, r=x+0.4;
			return [ l,	lo,	z,	l,	hi,	z,	r,	lo,	z,	r,	lo,	z,	l,	hi,	z,	r,  hi,	z];
		}
		onepiece(d,x,z){
			let l=x-0.4, r=x+0.4, my = (d.open+d.close)/2;
			return {
				body: [ l,	d.open,	z,	l,	d.close,	z,	r,	d.open,	z,	r,	d.open,	z,	l,	d.close,	z,	r,  d.close,	z],
				line: [x, d.low, z, 	x, d.high, z,	l, my, z,	r, my, z]
			}
		}
		glBuffer(data){
			let z = 10,xScale = this.xScale;
			let UpBody = [], UpLine = [], 
				DownBody=[], DownLine=[], 
				VolumeBody = [];

			let oneBody, oneVol;	
			for ( let d of data){
				let xt = xScale(d.date);
				oneBody =  this.onepiece(d,xt,z);
				if (d.close >= d.open){
					UpBody.push(...oneBody.body);
					UpLine.push(...oneBody.line);
				}
				else {
					DownBody.push(...oneBody.body);
					DownLine.push(...oneBody.line);
				}
				oneVol = candleShape.BodyArr(0, d.volume, xt, z);
				VolumeBody.push(...oneVol);
			}

			return {
				Count_Up: 	UpBody.length/18,
				Body_Up: 	new Float32Array(UpBody),
				Line_Up: 	new Float32Array(UpLine),

				Count_Down: DownBody.length/18,
				Body_Down: 	new Float32Array(DownBody),
				Line_Down: 	new Float32Array(DownLine),	

				VolCount: 	UpBody.length/18 + DownBody.length/18,
				Volume:   	new Float32Array(VolumeBody),

				plusItems:  ["Count_Up","Count_Down","VolCount"], 
				mergeItems: ["Body_Up","Line_Up","Body_Down","Line_Down","Volume"], 
			}			
		}
		reShape(data){
			if (data.length==0){
				this.buffer = this.initbuffer;
				return;
			}
			let addbuffer = this.glBuffer(data);
			this.buffer = KIM_Tools.Merge2glBuffer(this.initbuffer,addbuffer);
		}


		Draw(shader,xS,yS,ySV,colorOption,DoesDrawVol){
			shader.useProgram('Program_1');

			if(DoesDrawVol == "drawVolume"){
				this.draw_Volume(shader,xS,ySV);
			};
			if(colorOption == "defaultColor"){
				this.draw_Candle(shader,xS,yS);
			}else{
				this.draw_Candle(shader,xS,yS,colorOption);
			}
		}
		draw_Candle(shader,xS,yS,colorOption){
			if(typeof colorOption=="undefined"){
				colorOption = {
					UpColor: 0xff0000,
					DownColor:0x00ff00
				}
			};
			let candledata = this.buffer;
			let UpColor = new THREE.Color(colorOption.UpColor);
			let mygl = shader.gl, u_FragColor = shader.u_FragColor;
			shader.nowProgram.ChangeSight(xS,yS);


			mygl.uniform4f(u_FragColor, UpColor.r, UpColor.g, UpColor.b, 1.0);	
			mygl.bufferData(mygl.ARRAY_BUFFER, candledata.Body_Up, mygl.STATIC_DRAW);			
				mygl.drawArrays(mygl.TRIANGLES, 0, candledata.Count_Up*6); 	
			mygl.bufferData(mygl.ARRAY_BUFFER, candledata.Line_Up, mygl.STATIC_DRAW);
				mygl.drawArrays(mygl.LINES, 0, candledata.Count_Up*4); 	


			let DownColor = new THREE.Color(colorOption.DownColor);
			mygl.uniform4f(u_FragColor, DownColor.r, DownColor.g, DownColor.b, 1.0);
			mygl.bufferData(mygl.ARRAY_BUFFER, candledata.Body_Down, mygl.STATIC_DRAW);			
				mygl.drawArrays(mygl.TRIANGLES, 0, candledata.Count_Down*6); 	
			mygl.bufferData(mygl.ARRAY_BUFFER, candledata.Line_Down, mygl.STATIC_DRAW);
				mygl.drawArrays(mygl.LINES, 0, candledata.Count_Down*4); 	
		}
		draw_Volume(shader,xS,yS){
			shader.useProgram('Program_1');		
			let gl = shader.gl;
			let candledata = this.buffer;
			shader.nowProgram.setColor(0x888888);
			shader.nowProgram.ChangeSight(xS,[0,yS[1]*5]);
			gl.bufferData(gl.ARRAY_BUFFER, candledata.Volume, gl.STATIC_DRAW);
			gl.drawArrays(gl.TRIANGLES, 0, candledata.VolCount*6); 		
		}	
	}

	class simplelineShape extends shapeType{
		constructor(data,xScale,ids,colors){
			super(data)
			this.xScale = xScale;
			this.ids = ids;
			this.colors = {};
			ids.forEach((id,i)=>{ this.colors[id] = colors[i] });	
			this.initbuffer = this.glBuffer(this.data);
			this.reShape([]);			
		}
		onepiece(x1,y1,x2,y2,z){
			return [
				x1+0.4, y1, z,  	x2-0.4, y2, z,
				x2-0.4, y2, z,  	x2+0.4, y2, z
			];
		}		
		glBuffer(data){
			let ids = this.ids, colors = this.colors;

			let tmp = {}, preX = -1, preD = null, z = 10, AllCount = 0;
			ids.forEach(id=>{	tmp[id] = []  });

			for ( var d of data){
				AllCount++;
				let xt = this.xScale(d.date);
				if(preX == (xt-1)){
					ids.forEach(id=>{	tmp[id].push(...this.onepiece(preX, preD[id], xt, d[id], z) )});
				}else{
					ids.forEach(id=>{	tmp[id].push(...this.onepiece(xt, d[id], xt, d[id], z) )});
				}
				preD = d;	preX = xt;
			}
			ids.forEach(id=>{	
				tmp[id] = new Float32Array(tmp[id])
			});
			tmp.AllCount = AllCount;
			tmp.plusItems = ["AllCount"];
			tmp.mergeItems = ids;
			return tmp;
		}
		Draw(shader,ids,xS,yS){
			let t = this;
			shader.useProgram('Program_1');		
			let gl = shader.gl,
				u_FragColor = shader.u_FragColor;

			if(typeof xS!=="undefined"){
				shader.nowProgram.ChangeSight(xS,yS);
			};
			ids.forEach(id=>{
				let nColor = new THREE.Color(t.colors[id]);
				gl.uniform4f(u_FragColor, nColor.r, nColor.g, nColor.b, 1.0);	
				gl.bufferData(gl.ARRAY_BUFFER, t.buffer[id], gl.STATIC_DRAW);
				gl.drawArrays(gl.LINES, 0, t.buffer.AllCount*4); 
			});
		}
		reShape(data){
			if (data.length==0){
				this.buffer = this.initbuffer;
				return;
			}
		let addbuffer = this.glBuffer(data);
		this.buffer = KIM_Tools.Merge2glBuffer(this.initbuffer,addbuffer);
		}			
	} 

	class xylineShape extends shapeType{
		constructor(data,xname,yname,color,width,alpha){
			super(data);
			this.xname = xname;
			this.yname = yname;
			this.color = color;
			this.width = width;
			this.alpha = alpha;
			this.initbuffer = this.glBuffer(this.data);
			this.reShape([]);						
		}
		onepiece(x1,y1,x2,y2,z){
			let dx = x2 - x1, dy = y2 - y1, ll = Math.sqrt(dx**2 + dy**2);
			if (ll<0.0000001) ll=1;
			let vx = dx/ll,vy = dy/ll;
			return{
				Vertex: [
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x1, 	y1, 	z,
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x2, 	y2, 	z,
				],
				Dir: 	[ vy, -vx, 	vy, -vx,	-vy,  vx,	-vy,  vx,	 vy, -vx,	-vy,  vx]
			}
		}		
		glBuffer(data){
			let xname = this.xname, yname = this.yname;
			let tmp = {} , z=10, Count=0;
			tmp.buffer = [];	tmp.Dirbuffer = [];
			

			let pred = data[0];
			data.forEach(d=>{
				Count++;
				let onepiece = this.onepiece(
					pred[xname],pred[yname],d[xname],d[yname],z
				);
				tmp.buffer.push(...onepiece.Vertex);
				tmp.Dirbuffer.push(...onepiece.Dir);		
				pred = d;				
			});
			tmp.Count = Count;
			tmp.buffer = new Float32Array(tmp.buffer);
			tmp.Dirbuffer = new Float32Array(tmp.Dirbuffer);
			tmp.plusItems = ["Count"];
			tmp.mergeItems = ["buffer", "Dirbuffer"];
			return tmp;
		}
		Draw(shader, xS, yS, cw, ch, alpha, w){
			if (typeof alpha =="undefined"){
			    alpha = this.alpha;
			}			
			if (typeof w=="undefined"){
			    w = this.width;
			}			
			shader.useProgram('Program_2');		
			let cam = shader.nowProgram.ChangeSight(xS,yS);

			let gl = shader.gl;		
			let nColor = new THREE.Color(this.color);
			gl.uniform4f(shader.u_FragColor, nColor.r*alpha, nColor.g*alpha, nColor.b*alpha, 1);	

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.buffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.DirBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.Dirbuffer, gl.STATIC_DRAW);

			let xr = cam.left*2/cw, yr = cam.top*2/ch, xyr = Math.min(xr,yr);
			gl.uniform1f(shader.xr, xr);
			gl.uniform1f(shader.yr, yr);
			gl.uniform1f(shader.d, w * xyr);

			gl.drawArrays(gl.TRIANGLES, 0, this.buffer.Count*6); 	
		}
	}

	class tylineShape extends shapeType{
		constructor(data,xScale,id,color,width,alpha){
			super(data);
			this.xScale = xScale;
			this.id = id;
			this.color = color;
			this.width = width;
			this.alpha = alpha;
			this.initbuffer = this.glBuffer(this.data);
			this.reShape([]);						
		}	
		onepiece(x1,y1,x2,y2,z){
			let dx = x2 - x1, dy = y2 - y1, ll = Math.sqrt(dx**2 + dy**2);
			if (ll<0.0000001) ll=1;
			let vx = dx/ll, vy = dy/ll;
			return{
				Vertex: [
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x1, 	y1, 	z,
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x2, 	y2, 	z,
				],
				Dir: 	[ vy, -vx, 	vy, -vx,	-vy,  vx,	-vy,  vx,	 vy, -vx,	-vy,  vx]
			}
		}		
		glBuffer(data){
			let t = this;
			let	tmp = {
					Count: 0,
					buffer: [],
					Dirbuffer: [],
				}, 
				preX = -1, preD = null, 
				z=10, Count=0;

			
			for ( let d of data){
				Count++;
				let xt = this.xScale(d.date);
				if(preX == (xt-1)){
					let one = this.onepiece(preX, preD[t.id], xt, d[t.id], z);
					tmp.buffer.push(...one.Vertex);
					tmp.Dirbuffer.push(...one.Dir);		
				}else{
					let one = this.onepiece(xt, d[t.id], xt, d[t.id], z);
					tmp.buffer.push(...one.Vertex);
					tmp.Dirbuffer.push(...one.Dir);		
				}
				preD = d;	preX = xt;
			}
			tmp.Count = Count;
			tmp.buffer = new Float32Array(tmp.buffer);
			tmp.Dirbuffer = new Float32Array(tmp.Dirbuffer);
			tmp.plusItems = ["Count"];
			tmp.mergeItems = ["buffer", "Dirbuffer"];
			return tmp;
		}
		Draw(shader, xS, yS, cw, ch, alpha, w){
			if (typeof alpha =="undefined"){    alpha = this.alpha;}	
			if (typeof w=="undefined"){    w = this.width;	}	
			
			shader.useProgram('Program_2');		
			let cam = shader.nowProgram.ChangeSight(xS,yS);

			let gl = shader.gl;		
			let nColor = new THREE.Color(this.color);
			gl.uniform4f(shader.u_FragColor, nColor.r*alpha, nColor.g*alpha, nColor.b*alpha, 1);	

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.buffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.DirBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.Dirbuffer, gl.STATIC_DRAW);

			let xr = cam.left*2/cw, yr = cam.top*2/ch, xyr = Math.min(xr,yr);
			gl.uniform1f(shader.xr, xr);
			gl.uniform1f(shader.yr, yr);
			gl.uniform1f(shader.d, w * xyr);

			gl.drawArrays(gl.TRIANGLES, 0, this.buffer.Count*6); 	
		}
	}

	class xylineTriangleShape extends shapeType{
		constructor(data,xname,yname,color,width,alpha){
			super(data);
			this.xname = xname;
			this.yname = yname;
			this.color = color;
			this.width = width;
			this.alpha = alpha;
			this.initbuffer = this.glBuffer(this.data);
			this.reShape([]);						
		}
		onepiece(x1,y1,x2,y2,z){
			let dx = x2 - x1, dy = y2 - y1, ll = Math.sqrt(dx**2 + dy**2);
			if (ll<0.0000001) ll=1;
			let vx = dx/ll, vy = dy/ll;
			return{
				Vertex: [
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x1, 	y1, 	z,
				],
				Dir: 	[ vy, -vx, 	vy*0.2, -vx*0.2,	-vy,  vx]
			}
		}		
		glBuffer(data){
			let xname = this.xname, yname = this.yname;
			let tmp = {
					Count: 0,
					buffer: [],
					Dirbuffer: [],
				}, z=10, Count=0;

			let pred = data[0];
			data.forEach(d=>{
				if (d[yname] == 0) return;
				Count++;
				let onepiece = this.onepiece(
					pred[xname],pred[yname],d[xname],d[yname],z
				);
				tmp.buffer.push(...onepiece.Vertex);
				tmp.Dirbuffer.push(...onepiece.Dir);		
				pred = d;				
			});
			tmp.Count = Count;
			tmp.buffer = new Float32Array(tmp.buffer);
			tmp.Dirbuffer = new Float32Array(tmp.Dirbuffer);
			tmp.plusItems = ["Count"];
			tmp.mergeItems = ["buffer", "Dirbuffer"];
			return tmp;
		}
		Draw(shader, xS, yS, cw, ch, alpha, w){
			if (typeof alpha =="undefined"){
			    alpha = this.alpha;
			}			
			if (typeof w=="undefined"){
			    w = this.width;
			}			
			shader.useProgram('Program_2');		
			let cam = shader.nowProgram.ChangeSight(xS,yS);

			let gl = shader.gl;		
			let nColor = new THREE.Color(this.color);
			gl.uniform4f(shader.u_FragColor, nColor.r*alpha, nColor.g*alpha, nColor.b*alpha, 1);	

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.buffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, shader.DirBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.buffer.Dirbuffer, gl.STATIC_DRAW);

			let xr = cam.left*2/cw, yr = cam.top*2/ch, xyr = Math.min(xr,yr);
			gl.uniform1f(shader.xr, xr);
			gl.uniform1f(shader.yr, yr);
			gl.uniform1f(shader.d, w * xyr);

			gl.drawArrays(gl.TRIANGLES, 0, this.buffer.Count*3); 	
		}
	}


// Define - SHbrush & BrushPad
	class SHbrush{
	    constructor(motherDOM,width,height,sh,DorM,SHDTs) {
	    	console.log(DorM);
	    	this.DorM = DorM;
	    	this.child = [];
	        this.motherDOM = motherDOM; 
	        this.sh = sh; 
	        this.width = width;	
	        this.height = height;


	        // this.shdate = sh[this.DorM].map( techan.plot.candlestick().accessor().d);
	        if(this.DorM=="DK") this.shdate = SHDTs.DK;
	        if(this.DorM=="M5"){
	        	this.shdate = sh[this.DorM].map( techan.plot.candlestick().accessor().d);
	        	var lasttime = this.shdate[this.shdate.length-1];
	        	var last_i=0;
	        	console.log(lasttime);
	        	for(var i=0;i<SHDTs.M5.length;i++){
	        		if(SHDTs.M5[i]>=lasttime && SHDTs.M5[i]<=lasttime){
	        			last_i=i;
	        			break;
	        		}  
	        	}
	        	for(var i=0;i<240*2;i++){
	        		this.shdate.push(SHDTs.M5[last_i+1+i]);
	        	}
	    	};
	        


			this.sh_xScale = d3.scaleOrdinal().domain(this.shdate).range(d3.range(1,10000));
			this.xScale = techan.scale.financetime()
				.range([0,this.width])
				.domain(this.shdate);
			this.yScale = d3.scaleLinear()
				.range([this.height,0])
				.domain(
					techan.scale.plot.ohlc(
						this.sh[this.DorM],techan.plot.ohlc().accessor()
					).domain()
				);        

	  		this.DOM = this.motherDOM
	  			.append("g").attr("class","BRUSH DK");    
		    this.line_DOM = this.DOM
		    	.append("g").attr("class", "close")
	 			.datum(this.sh[this.DorM])
	 			.call(
		 			techan.plot.close().xScale(this.xScale).yScale(this.yScale)
	 			);     

	   		var t = this;
		    this.brushedfcn = function(){
		    	let tt = new Date();
		    	t.DTs = t.shdate;
		    	try{
				    if(d3.event.selection !== null){
				    	t.DTs = t.shdate.slice.apply(t.shdate,  d3.event.selection.map(t.xScale.zoomable().invert));
				    };	    		
		    	}catch{}
			   	t.xS = [t.sh_xScale(t.DTs[0])-0.5,	t.sh_xScale(t.DTs[t.DTs.length-1])+0.5];	
				t.yS = KIM_Tools.getYDomain_type_ochl(t.sh[t.DorM],t.DTs);
				t.child.forEach(	function(childchart,index){childchart.Draw();});
				console.log("brush All: ", new Date()-tt);
		    }
		    this.pane_DOM = this.DOM
		    	.append("g").attr("class", "pane")
	        	.call(
	        		d3.brushX()
	        			.extent([[0, 0], [this.width, this.height]])
	        			.on("brush end", this.brushedfcn)
	        	)
	        	.selectAll("rect")
	        	.attr("height", this.height); 	

	        // for webgl
			// this.bodyr = KIMGL_CandleBody_withZ(this.sh[this.DorM],this.sh_xScale,10);
			// this.bodyr = KIMGL_Candlechart.glBuffer_Candle(this.sh[this.DorM],this.sh_xScale,10);
			let tailCount = 1;if(this.DorM === "M5"){tailCount = 48;}		

			this.bodyr = new candleShape(this.sh[this.DorM],this.sh_xScale,tailCount);


			this.shcamera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 10000);
			// this.xticks = KIMGL_MonthGrid_withZ(this.shdate, this.sh_xScale, 20);
	    }
	    pushchild(a){
	    	this.child.push(a);
	    }
	    calMPV(){
			var viewMatrix = new Matrix4();
			viewMatrix.setLookAt(this.shcamera.position.x, this.shcamera.position.y, -1, this.shcamera.position.x, this.shcamera.position.y, 0, 0, 1, 0);

			var modelViewMatrix = this.shcamera.projectionMatrix;
			modelViewMatrix.multiply(viewMatrix);	
			this.MPV = modelViewMatrix;
	    }
	    glDrawSH(mygl,shader){
	    	shader.useProgram('Program_1');
			// shader.nowProgram.ChangeSight(this.xS,this.yS);
			// KIMGL_Candlechart.Draw_CandleChart(shader.gl,this.bodyr,shader.u_FragColor,{UpColor:0xAAAAAA, DownColor:0x333333});
			// this.bodyr.Draw(shader,{UpColor:0xAAAAAA, DownColor:0x333333});
			this.bodyr.draw_Candle(
				shader,
				this.xS,
				this.yS,
				{UpColor:0xAAAAAA, DownColor:0x333333}
			);

			var TickColor = new THREE.Color(0x333333);
			shader.gl.bufferData(shader.gl.ARRAY_BUFFER, this.xticks.Texels, shader.gl.STATIC_DRAW);
			shader.gl.uniform4f(shader.u_FragColor, TickColor.r, TickColor.g, TickColor.b, 1.0);		
			shader.gl.drawArrays(shader.gl.LINES, 0, this.xticks.Count*2); 
	    }
	}

	class BrushPad{
		constructor(motherDOM,width,height){
			this.motherDOM = motherDOM;
			this.width = width;
			this.height = height;
			this.sh = new Stock("0000011");

	        this.SH_DTs = new SH_DTs();
	        console.log(this.SH_DTs);
			
	        this.sh.load_DK();
	        this.svg_SHdomain = d3.select(this.motherDOM)
	            .append("svg")
	            .attr("style","background:black")            
	            .attr("width", this.width)
	            .attr("height",this.height);

	        this.DK_brush = new SHbrush(this.svg_SHdomain,this.width,this.height,this.sh,"DK",this.SH_DTs);
	        this.DK_brush.xticks = KIMGL_MonthGrid_withZ(this.DK_brush.shdate, this.DK_brush.sh_xScale, 20);
	        this.DK_brush.brushedfcn();   

	        this.sh.load_M5();
	        this.svg_SHdomain_M5 = d3.select(this.motherDOM)
	            .append("svg")
	            .attr("style","background:black")            
	            .attr("width", this.width)
	            .attr("height",this.height);

	        this.M5_brush = new SHbrush(this.svg_SHdomain_M5,this.width,this.height,this.sh,"M5",this.SH_DTs);
	        this.M5_brush.xticks = KIMGL_DayGrid_withZ(this.M5_brush.shdate, this.M5_brush.sh_xScale,1);
	        this.M5_brush.brushedfcn();   
		}
	}

// Define SVG_for_Canvas
	class SVG_for_Canvas{
		constructor(motherDOM,canvas){
			this.motherDOM = motherDOM;
			this.canvas = canvas;
			this.svg_DOM = d3.select(this.motherDOM).append("svg")
				.attr("width",this.canvas.width)
				.attr("height",this.canvas.height)
				.attr("style","background:none")
				.style("position","absolute")
				.style("top",this.canvas.style.top)
				.style("left",this.canvas.style.left)	
				.on("wheel", this.mousewheel);			

			this.xScale = d3.scaleLinear().range([0,this.canvas.width]);
			this.yScale = d3.scaleLinear().range([this.canvas.height,0]);

			this.grid_x_DOM = this.svg_DOM
				.append("g")
				.attr("class","grid x")
				.attr("transform","translate(0," + this.canvas.height + ")")
				.style("stroke-dasharray",("1,1"));
			this.grid_y_DOM = this.svg_DOM
				.append("g")
				.attr("class","grid y")
				.style("stroke-dasharray",("1,1"));
			this.drawfcn = [];
		}
		set_ScaleDomain_var(xD,yD){
			this.xScale.domain(xD);
			this.yScale.domain(yD);
		}
		mousewheel(){
			console.log(d3.event.wheelDelta);
		            // var direction = d3.event.wheelDelta < 0 ? 'down' : 'up';
		            // zoom(direction === 'up' ? d : d.parent);
		}
		resize(){
			console.log("SVG_for_Canvas/resize");
			this.svg_DOM
				.attr("width",this.canvas.width)
				.attr("height",this.canvas.height)
				.style("position","absolute")

				.style("top",this.canvas.style.top)
				.style("left",this.canvas.style.left);	

			this.xScale.range([0,this.canvas.width]);
			this.yScale.range([this.canvas.height,0]);
			this.grid_x_DOM
				.attr("transform","translate(0," + this.canvas.height + ")");
		}	
	}

// Define KIMGL_Candlechart
	class KIMGL_Candlechart extends KIMGL_Simple{
		constructor(stock,DorM,motherDOM,canvas,brushPad,shader){
			super(canvas,shader);
			this.motherDOM = motherDOM;
			this.stock = stock;	
			this.DorM = DorM;	
			this.brushPad = brushPad;			
						
					
			this.bodyr_Pre = new candleShape(this.stock[this.DorM],this.brushPad.sh_xScale);
			this.bodyr = KIM_Tools.Clone(this.bodyr_Pre);

			this.indexr_Pre = new simplelineShape(
				this.stock[this.DorM],
				this.brushPad.sh_xScale,
				["AVP15","AVP30","AVP60","AVP120","AVP240"],
				[0xAA0000,0x00AA00,0x0000AA,0x00AAAA,0xAAAA00]
			);
			this.indexr = KIM_Tools.Clone(this.indexr_Pre);

	    	this.Model1 = new simplelineShape(
				this.stock[this.DorM],
				this.brushPad.sh_xScale,
				["MODEL1"],
				[0xFFFFFF]
			);


			this.SVGonCanvas = new SVG_for_Date_Price_Plane(this.motherDOM, this.canvas);
			if(this.DorM === "M5"){
				this.SVGonCanvas.dateformat = '%Y-%m-%d %H:%M';
		        this.SVGonCanvas.dateformatlength = 100;
		        this.SVGonCanvas.yticks_gap = 2;			
			}

			this.drawfcn = [];
			this.drawfcn.push(function(t){
				t.brushPad.glDrawSH(t,t.shader);	
			});	
			this.drawfcn.push(function(t){
				t.draw_candlechart();	
			});	
			this.drawfcn.push(function(t){
				t.draw_AVP();	
			});
			this.drawfcn.push(function(t){
				t.draw_Model1();
			});	


		}

		update_TDY(){
			var tt = new Date();			
			this.bodyr_Pre.reShape(this.stock[this.DorM+"_TDY"]);
			this.indexr_Pre.reShape(this.stock[this.DorM+"_TDY"]);
			if(this.DorM === "M5"){
				this.Model1.reShape(this.stock[this.DorM+"_TDY"]);
			}
			this.Draw();
		}
		subDraw(){
			this.subdata = KIM_Tools.slice_by_daterange(this.stock[this.DorM],this.brushPad.DTs);
			var t = this;
			this.drawfcn.forEach(	
				function(fcn,index){
					fcn(t);
				}
			);
			this.SVGonCanvas.Draw();
		}
		draw_ZJM5(){
			this.ZJM5.Draw(
				this.shader,["ZJM5"],
				this.brushPad.xS,
				d3.extent(
					KIM_Tools.slice_by_daterange(this.stock.ZJM5,this.brushPad.DTs)
					.map(d=>{return d.ZJM5})
				)
			);
		}
		draw_Model1(){		
			this.Model1.Draw(this.shader,["MODEL1"]);
		}
		draw_AVP(){
			this.indexr_Pre.Draw(this.shader,["AVP15","AVP30","AVP60","AVP120","AVP240"]);	
		}
		draw_candlechart(){
			this.yS_candlechart = techan.scale.plot.ohlc(this.subdata,techan.plot.candlestick().accessor()).domain();
			// if(this.DorM === "M5"){
				var Model1_S = d3.extent(this.subdata.map(function(d){if(d.MODEL1>0) return d.MODEL1}));
				if (Model1_S[0]>0){
					this.yS_candlechart = [Math.min(this.yS_candlechart[0],Model1_S[0]), Math.max(this.yS_candlechart[1],Model1_S[1])];
				}
			// }

			this.bodyr_Pre.Draw(
				this.shader,
				this.brushPad.xS,
				this.yS_candlechart,
				techan.scale.plot.volume(this.subdata).domain(),
				"defaultColor",
				"drawVolume"
			);

			if(this.subdata.length>0){
				this.SVGonCanvas.set_ScaleDomain_var(this.brushPad.DTs, this.yS_candlechart);
			}else{
				this.SVGonCanvas.set_ScaleDomain_var(this.brushPad.DTs, [0,1]);
			}
		}
	}

	class SVG_for_Date_Price_Plane extends SVG_for_Canvas{
		constructor(motherDOM,canvas){
			super(motherDOM,canvas);
			this.crosshair_DOM 	 = this.svg_DOM.append("g").attr("class","crosshair");
			this.dateformat = '%Y-%m-%d';
	        this.dateformatlength = 65;
	        this.yticks_gap = 10;
	        this.xScale = techan.scale.financetime().range([0,this.canvas.width]);
	        this.line = this.svg_DOM.append("g")
	        	.append("path")
	        	.attr("fill", "none")
			    .attr("stroke", "steelblue")
			    .attr("stroke-width", 2);	        
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
			// grid y
			this.grid_y_DOM.call(
				d3.axisLeft(this.yScale)
					.tickValues(this.getYticks(this.yScale.domain(),this.yticks_gap))
					.tickSize(-this.canvas.width).tickFormat("")
			);

			function cursormove(coord){
				if ("MP" in t){
					t.MP.moveTargetCircle(coord);
				}			
			}
			if ("drawfcn" in this){
				this.drawfcn.forEach(function(fcn,index){	
						fcn(t);			
				});				
			}
		}
		getYticks(d,gap){
			var re=[];
			for (var i=Math.ceil(Math.floor(d[0])/gap);i<=Math.floor(Math.ceil(d[1])/gap);i++){
				re.push(i*gap);
			}
			return re;	    	
	    }
	}

// Define KIMGL_SAchart
	class KIMGL_SAchart extends KIMGL_Simple{
		constructor(stock,motherDOM,canvas,nDK_brush,shader){
			super(canvas,shader);
			this.motherDOM = motherDOM;
			this.stock = stock;		
			this.brushPad = nDK_brush;
			this.SVGonCanvas = new SVG_for_XY_Plane(this.motherDOM, this.canvas, this);	

			this.SA15r = new xylineTriangleShape(this.stock.DK,"SHC15","AVP15",0xFF0000,2,0.5);
			this.SA30r = new xylineTriangleShape(this.stock.DK,"SHC30","AVP30",0x00FF00,2,0.5);
			this.SA60r = new xylineTriangleShape(this.stock.DK,"SHC60","AVP60",0x0000AA,2,0.5);
			this.SA120r = new xylineTriangleShape(this.stock.DK,"SHC120","AVP120",0x00AAAA,2,0.5);
			this.SA240r = new xylineTriangleShape(this.stock.DK,"SHC240","AVP240",0xAAAA00,2,0.5);

			// this.SA15r = KIMGL_SAchart.makebuffer_LineWidth_monthly("SHC15","AVP15",this.stock.DK,1);
			// this.SA30r = KIMGL_SAchart.makebuffer_LineWidth_monthly("SHC30","AVP30",this.stock.DK,1);
			// this.SA60r = KIMGL_SAchart.makebuffer_LineWidth_monthly("SHC60","AVP60",this.stock.DK,1);
			// this.SA120r = KIMGL_SAchart.makebuffer_LineWidth_monthly("SHC120","AVP120",this.stock.DK,1);
			// this.SA240r = KIMGL_SAchart.makebuffer_LineWidth_monthly("SHC240","AVP240",this.stock.DK,1);	

			this.xScale = d3.scaleLinear().range([0,this.canvas.width]);
			this.yScale = d3.scaleLinear().range([this.canvas.height,0]);

			const Mid = arr => (arr[0]+arr[1])/2,
				  DIf = arr => (arr[1]-arr[0])/2,
				  getY = function(half_x,mid,ratio){	return [mid-half_x*ratio,mid+half_x*ratio] };
			var minmaxY = d3.extent(this.stock.DK.map(function(d){return d.AVP15})),
				minmaxX = d3.extent(this.stock.DK.map(function(d){return d.SHC15})),
				midpoint = [Mid(minmaxX),Mid(minmaxY)],
				d = [DIf(minmaxX),DIf(minmaxY)],
				ratio_view = -DIf(this.yScale.range())/DIf(this.xScale.range());
			if (ratio_view <  (d[1]/d[0])){
				this.yScale.domain(minmaxY);	this.xScale.domain(getY(d[1],midpoint[0],1/ratio_view));
			}else{
				this.xScale.domain(minmaxX);	this.yScale.domain(getY(d[0],midpoint[1],ratio_view));
			}
			this.SVGonCanvas.set_ScaleDomain_var(this.xScale.domain(), this.yScale.domain());
			this.zoomed_xScale = this.xScale.copy();
			this.zoomed_yScale = this.yScale.copy();
		}
		update_TDY(){
			var tt = new Date();			
			this.SA15r.reShape(this.stock["DK_TDY"]);
			this.SA30r.reShape(this.stock["DK_TDY"]);
			this.SA60r.reShape(this.stock["DK_TDY"]);
			this.SA120r.reShape(this.stock["DK_TDY"]);
			this.SA240r.reShape(this.stock["DK_TDY"]);
			this.Draw();
		}		
		resize(){
			this.xScale.range([0,this.canvas.width]);
			this.yScale.range([this.canvas.height,0]);


			const Mid = arr => (arr[0]+arr[1])/2,
				  DIf = arr => (arr[1]-arr[0])/2,
				  getY = function(half_x,mid,ratio){	return [mid-half_x*ratio,mid+half_x*ratio] };
			var minmaxY = d3.extent(this.stock.DK.map(function(d){return d.AVP15})),
				minmaxX = d3.extent(this.stock.DK.map(function(d){return d.SHC15})),
				midpoint = [Mid(minmaxX),Mid(minmaxY)],
				d = [DIf(minmaxX),DIf(minmaxY)],
				ratio_view = -DIf(this.yScale.range())/DIf(this.xScale.range());
			if (ratio_view <  (d[1]/d[0])){
				this.yScale.domain(minmaxY);	this.xScale.domain(getY(d[1],midpoint[0],1/ratio_view));
			}else{
				this.xScale.domain(minmaxX);	this.yScale.domain(getY(d[0],midpoint[1],ratio_view));
			}
			this.SVGonCanvas.set_ScaleDomain_var(this.xScale.domain(), this.yScale.domain());
			this.zoomed_xScale = this.xScale.copy();
			this.zoomed_yScale = this.yScale.copy();	
			this.SVGonCanvas.resize();
		}

		subDraw(){
			this.SA15r.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,2				
			);
			this.SA30r.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,2				
			);
			this.SA60r.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,2				
			);
			this.SA120r.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,2				
			);			
			this.SA240r.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,2				
			);
			this.SVGonCanvas.Draw();
		}
		// drawlineWidthM3(bufferStruct,color,cam){
		// 	this.drawlineWidth(bufferStruct.m1,color,1,cam,1);
		// 	this.drawlineWidth(bufferStruct.m2,color,0.25,cam,1);
		// 	this.drawlineWidth(bufferStruct.m3,color,1,cam,2);		
		// }
		// drawline(bufferStruct,color){
		// 	let gl = this.shader.gl;	
		// 	gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.buffer, gl.STATIC_DRAW);
		// 	gl.uniform4f(this.shader.u_FragColor, color.r, color.g, color.b, 1.0);		
		// 	gl.drawArrays(gl.LINES, 0, bufferStruct.Count*2); 		
		// }
		// drawlineWidth(bufferStruct,color,alpha,cam,width){
		// 	let gl = this.shader.gl;			
		// 	gl.uniform4f(this.shader.u_FragColor, color.r*alpha, color.g*alpha, color.b*alpha, 1);	

		// 	gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.vertexBuffer);
		// 	gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.buffer, gl.STATIC_DRAW);

		// 	gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.DirBuffer);
		// 	gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.Dirbuffer, gl.STATIC_DRAW);

		// 	gl.uniform1f(this.shader.d, cam.right/this.canvas.width * width);	

		// 	gl.drawArrays(gl.TRIANGLES, 0, bufferStruct.Count*6); 			
		// }


		// static makebuffer_XYScatterLine_withZ(xname,yname,data,z){
		// 	var xyArray=[],	xArray=[],	yArray=[], Count=1;

		// 	var d = data[0];	xyArray.push(...[d[xname], d[yname], z]);  
		// 	for ( var d of data){
		// 		Count++;
		// 		xyArray.push(...[
		// 			d[xname], d[yname], z,
		// 			d[xname], d[yname], z,				  
		// 		]);
		// 		xArray.push(d[xname]);
		// 		yArray.push(d[yname]);
		// 	}
		// 	d = data[data.length-1];	xyArray.push(...[d[xname], d[yname], z]);  

		// 	return {
		// 			Count: 			Count,
		// 			buffer: 		new Float32Array(xyArray),
		// 			xArray: 		xArray, 
		// 			yArray: 		yArray,
		// 			xArrayDomain: 	d3.extent(xArray),
		// 			yArrayDomain: 	d3.extent(yArray),
		// 	}
		// }
		// static makebuffer_LineWidth_withZ(xname,yname,data,z){
		// 	var xyArray=[], DirArray=[], Count=0, pred = data[0];
		// 	for ( var d of data){
		// 		Count++;
		// 		var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
		// 		xyArray.push(...onepiece.Vertex);
		// 		DirArray.push(...onepiece.Dir);		
		// 		pred = d;
		// 	}
		// 	return {
		// 			Count: 			Count,
		// 			buffer: 		new Float32Array(xyArray),
		// 			Dirbuffer: 		new Float32Array(DirArray), 
		// 	}
		// }
		static fcn_onepieceRect(x1,y1,x2,y2,z){
			var dx = x2-x1, dy = y2 - y1;
			var ll = Math.sqrt(dx*dx+dy*dy);if (ll<0.00000000000001) ll=1;
			var vx = dx/ll,vy = dy/ll;
			return{
				Vertex: [
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x1, 	y1, 	z,
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x2, 	y2, 	z,
				],
				Dir: 	[ vy, -vx, 	vy, -vx,	-vy,  vx,	-vy,  vx,	 vy, -vx,	-vy,  vx]
			}
		}
		// static build_monthgroup_index(data){
		// 	var monthgroup_index=[];
		// 	var lasttick=-1;
		// 	data.forEach(function(item,index){
		// 		if (lasttick != item.date.getMonth()) {
		// 			if (monthgroup_index.length>0){
		// 				monthgroup_index[monthgroup_index.length-1].push(index);
		// 			}
		// 			lasttick = item.date.getMonth();
		// 			monthgroup_index.push([]);
		// 		}
		// 		monthgroup_index[monthgroup_index.length-1].push(index);
		// 	});
		// 	return monthgroup_index;
		// }
		// static makebuffer_LineWidth_monthly(xname,yname,data,z){
		// 	var monthly_index = KIMGL_SAchart.build_monthgroup_index(data);
		// 	var xyArray1=[], DirArray1=[], Count1=0,ii=0;
		// 	var xyArray2=[], DirArray2=[], Count2=0;
		// 	var xyArray3=[], DirArray3=[], Count3=0;
		// 	var pred;

		// 	for(var index=0;index<monthly_index.length;index++){
		// 		var onemonth = monthly_index[index];

		// 		ii++;if(ii==3){ii=0} 
		// 		if (ii==0){
		// 			pred = data[onemonth[0]];
		// 			for ( var iii of onemonth){
		// 				Count1++;
		// 				var d = data[iii];
		// 				var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
		// 				xyArray1.push(...onepiece.Vertex);
		// 				DirArray1.push(...onepiece.Dir);		
		// 				pred = d;
		// 			}				
		// 		}
		// 		if (ii==1){
		// 			pred = data[onemonth[0]];
		// 			for ( var iii of onemonth){
		// 				Count2++;
		// 				var d = data[iii];
		// 				var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
		// 				xyArray2.push(...onepiece.Vertex);
		// 				DirArray2.push(...onepiece.Dir);		
		// 				pred = d;
		// 			}				
		// 		}
		// 		if (ii==2){
		// 			pred = data[onemonth[0]];
		// 			for ( var iii of onemonth){
		// 				Count3++;
		// 				var d = data[iii];
		// 				var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
		// 				xyArray3.push(...onepiece.Vertex);DirArray3.push(...onepiece.Dir);
		// 				pred = d;
		// 			}				
		// 		}
		// 	};

		// 	return {
		// 			m1: {
		// 					Count: 			Count1,
		// 					buffer: 			new Float32Array(xyArray1),
		// 					Dirbuffer: 		new Float32Array(DirArray1), 
		// 			},
		// 			m2: {
		// 					Count: 			Count2,
		// 					buffer: 			new Float32Array(xyArray2),
		// 					Dirbuffer: 		new Float32Array(DirArray2),
		// 			},
		// 			m3:	{
		// 					Count: 			Count3,
		// 					buffer: 			new Float32Array(xyArray3),
		// 					Dirbuffer: 		new Float32Array(DirArray3), 						
		// 			}
		// 	}
		// }
	}

	class SVG_for_XY_Plane extends SVG_for_Canvas{
		constructor(motherDOM,canvas,glSide){
			super(motherDOM,canvas);
			this.glSide = glSide;
			this.zoomrect = this.svg_DOM.append("rect")
				.attr("width", this.canvas.width)
				.attr("height", this.canvas.height)
				.style("fill", "none")
				.style("pointer-events", "all");

			var t = this;
			this.zoomrect.call(
				d3.zoom()
				    .scaleExtent([0.1, 500])
				    .extent([[0, 0], [t.canvas.width, t.canvas.height]])
				    .on("zoom", function () {			    	
				    	t.zoomtransform = d3.event.transform;

						var zoomed_xScale = t.zoomtransform.rescaleX(t.xScale);
						var zoomed_yScale = t.zoomtransform.rescaleY(t.yScale);	
						t.glSide.zoomed_xScale.domain(zoomed_xScale.domain());
						t.glSide.zoomed_yScale.domain(zoomed_yScale.domain());
						t.glSide.Draw();
					})
			);	

		}
		resize(){
			super.resize();
			this.zoomrect = this.svg_DOM.append("rect")
				.attr("width", this.canvas.width)
				.attr("height", this.canvas.height)
				.style("fill", "none")
				.style("pointer-events", "all");

			var t = this;
			this.zoomrect.call(
				d3.zoom()
				    .scaleExtent([0.1, 500])
				    .extent([[0, 0], [t.canvas.width, t.canvas.height]])
				    .on("zoom", function () {			    	
				    	t.zoomtransform = d3.event.transform;

						var zoomed_xScale = t.zoomtransform.rescaleX(t.xScale);
						var zoomed_yScale = t.zoomtransform.rescaleY(t.yScale);	
						t.glSide.zoomed_xScale.domain(zoomed_xScale.domain());
						t.glSide.zoomed_yScale.domain(zoomed_yScale.domain());
						t.glSide.Draw();
					})
			);



		}
		Draw(){
			var zoomed_xScale, zoomed_yScale;
			this.zoomed_xScale = this.xScale;	this.zoomed_yScale = this.yScale;
			try{
				this.zoomed_xScale = this.zoomtransform.rescaleX(this.xScale);
				this.zoomed_yScale = this.zoomtransform.rescaleY(this.yScale);			
			}catch{
				// zoomed_xScale = this.xScale;	zoomed_yScale = this.yScale;
			}

			this.grid_y_DOM.call(
				d3.axisLeft(this.zoomed_yScale)
					.tickValues(this.getYticks(this.zoomed_yScale.domain()))
					.tickSize(-this.canvas.width).tickFormat("")
			);
			this.grid_x_DOM.call(
				d3.axisBottom(this.zoomed_xScale)
					.tickValues(this.getYticks(this.zoomed_xScale.domain()))
					.tickSize(-this.canvas.height).tickFormat("")
			);
		}

		getYticks(d){
			var re=[];
			for (var i=Math.ceil(Math.floor(d[0])/10);i<=Math.floor(Math.ceil(d[1])/10);i++){
				re.push(i*10);
			}
			return re;	    	
	    }	
	}

// Define KIMGL_MPchart
	class KIMGL_MPchart extends KIMGL_Simple{
		constructor(stock,motherDOM,canvas,nDK_brush,shader){
			super(canvas,shader);
			this.motherDOM = motherDOM;
			this.stock = stock;		
			this.brushPad = nDK_brush;
			this.SVGonCanvas = new SVG_for_MPchart(this.motherDOM, this.canvas, this);	
			// var k = Math.exp(Math.log(0.1)/120),kk = 1+k;
			this.MPdata = [];
			var t = this;
			this.stock.M5.forEach(	
				function(d,i){
					var x = d.MODEL1_15, y = d.AVP15;
					if(x>0 && y>0) {	t.MPdata.push({date: d.date, close: y, MODEL1: x}); }
				}
			);
			// this.MPr = KIMGL_MPchart.makebuffer_LineWidth_dately("MODEL1","close",this.MPdata ,1);
			this.MPr = new xylineTriangleShape(this.MPdata,"MODEL1","close",0xFF0000, 2, 1);
			var xyArray = [], DirArray=[];
			var onepiece = KIMGL_SAchart.fcn_onepieceRect(0,0,1000,1000,1);
			xyArray.push(...onepiece.Vertex);DirArray.push(...onepiece.Dir);	

			onepiece = KIMGL_SAchart.fcn_onepieceRect(0,-10,1000,990,1);
			xyArray.push(...onepiece.Vertex);DirArray.push(...onepiece.Dir);	

			onepiece = KIMGL_SAchart.fcn_onepieceRect(0,10,1000,1010,1);
			xyArray.push(...onepiece.Vertex);DirArray.push(...onepiece.Dir);
			this.lines = {
				Count: 			3,
				buffer: 		new Float32Array(xyArray),
				Dirbuffer: 		new Float32Array(DirArray), 
			};


			this.xScale = d3.scaleLinear().range([0,this.canvas.width]);
			this.yScale = d3.scaleLinear().range([this.canvas.height,0]);
			const Mid = arr => (arr[0]+arr[1])/2,
				  DIf = arr => (arr[1]-arr[0])/2,
				  getY = function(half_x,mid,ratio){	return [mid-half_x*ratio,mid+half_x*ratio] };
			var minmaxY = d3.extent(this.MPdata.map(function(d){return d.MODEL1})),
				minmaxX = d3.extent(this.MPdata.map(function(d){return d.close})),
				midpoint = [Mid(minmaxX),Mid(minmaxY)],
				d = [DIf(minmaxX),DIf(minmaxY)],
				ratio_view = -DIf(this.yScale.range())/DIf(this.xScale.range());
			if (ratio_view <  (d[1]/d[0])){
				this.yScale.domain(minmaxY);	this.xScale.domain(getY(d[1],midpoint[0],1/ratio_view));
			}else{
				this.xScale.domain(minmaxX);	this.yScale.domain(getY(d[0],midpoint[1],ratio_view));
			}


			this.SVGonCanvas.set_ScaleDomain_var(this.xScale.domain(), this.yScale.domain());
			this.zoomed_xScale = this.xScale.copy();
			this.zoomed_yScale = this.yScale.copy();
		}
		update_TDY(){
			var tt = new Date();			
			console.log("KIMGL_MPchart/update_TDY has not been implemented !");
			this.Draw();
		}		
		resize(){
			super.resize();
			this.xScale = d3.scaleLinear().range([0,this.canvas.width]);
			this.yScale = d3.scaleLinear().range([this.canvas.height,0]);
			const Mid = arr => (arr[0]+arr[1])/2,
				  DIf = arr => (arr[1]-arr[0])/2,
				  getY = function(half_x,mid,ratio){	return [mid-half_x*ratio,mid+half_x*ratio] };
			var minmaxY = d3.extent(this.MPdata.map(function(d){return d.MODEL1})),
				minmaxX = d3.extent(this.MPdata.map(function(d){return d.close})),
				midpoint = [Mid(minmaxX),Mid(minmaxY)],
				d = [DIf(minmaxX),DIf(minmaxY)],
				ratio_view = -DIf(this.yScale.range())/DIf(this.xScale.range());
			if (ratio_view <  (d[1]/d[0])){
				this.yScale.domain(minmaxY);	this.xScale.domain(getY(d[1],midpoint[0],1/ratio_view));
			}else{
				this.xScale.domain(minmaxX);	this.yScale.domain(getY(d[0],midpoint[1],ratio_view));
			}
			this.zoomed_xScale = this.xScale.copy();
			this.zoomed_yScale = this.yScale.copy();
			this.SVGonCanvas.set_ScaleDomain_var(this.xScale.domain(), this.yScale.domain());
		}

		subDraw(){
			this.shader.useProgram('Program_3');			
			var cam = this.ChangeSight(this.zoomed_xScale.domain(),this.zoomed_yScale.domain());

			// this.drawlineWidthM3(this.MPr,new THREE.Color(0xFF0000),cam);
			this.MPr.Draw(this.shader,
				this.zoomed_xScale.domain(),this.zoomed_yScale.domain(),
				this.canvas.width, this.canvas.height,				
			);

			this.drawlineWidth(this.lines,new THREE.Color(0xFFFFFF),1,cam,1);
			this.SVGonCanvas.Draw();
		}

		// drawlineWidthM3(bufferStruct,color,cam){
		// 	this.drawlineWidth(bufferStruct.m1,color,1,cam,1);
		// 	this.drawlineWidth(bufferStruct.m2,color,0.5,cam,1);
		// 	this.drawlineWidth(bufferStruct.m3,color,1,cam,2);		
		// }
		// drawlineWidthStripe(bufferStruct,color,cam){
		// 	this.drawlineWidth(bufferStruct.m1,color,1,cam,1);
		// 	this.drawlineWidth(bufferStruct.m2,color,0.5,cam,1);
		// }


		drawline(bufferStruct,color){
			this.shader.useProgram('Program_3');

			let gl = this.shader.gl;

			gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.buffer, gl.STATIC_DRAW);
			gl.uniform4f(this.shader.u_FragColor, color.r, color.g, color.b, 1.0);		
			gl.drawArrays(gl.LINES, 0, bufferStruct.Count*2); 		
		}
		drawlineWidth(bufferStruct,color,alpha,cam,width){
			this.shader.useProgram('Program_3');

			let gl = this.shader.gl;
			gl.uniform4f(this.shader.u_FragColor, color.r*alpha, color.g*alpha, color.b*alpha, 1);	
			// gl.uniform4f(this.shader.u_FragColor, color.r, color.g, color.b, alpha);	

			gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.buffer, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.DirBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, bufferStruct.Dirbuffer, gl.STATIC_DRAW);

			gl.uniform1f(this.shader.d, cam.right/this.canvas.width * width);	

			gl.drawArrays(gl.TRIANGLES, 0, bufferStruct.Count*6); 			
		}
		moveTargetCircle(coord){
			var dd = this.MPdata.filter(d => {
			  return !(d.date > coord.x) && !(d.date < coord.x)
			});
			if (dd.length>0){
				var ddd = dd[0];
				// this.SVGonCanvas.moveTargetCircle(this.xScale(ddd.MODEL1) , this.yScale(ddd.close) );
				this.SVGonCanvas.moveTargetCircle(ddd.MODEL1, ddd.close);

			}

		}


		static makebuffer_XYScatterLine_withZ(xname,yname,data,z){
			var xyArray=[],	xArray=[],	yArray=[], Count=1;

			var d = data[0];	xyArray.push(...[d[xname], d[yname], z]);  
			for ( var d of data){
				Count++;
				xyArray.push(...[
					d[xname], d[yname], z,
					d[xname], d[yname], z,				  
				]);
				xArray.push(d[xname]);
				yArray.push(d[yname]);
			}
			d = data[data.length-1];	xyArray.push(...[d[xname], d[yname], z]);  

			return {
					Count: 			Count,
					buffer: 		new Float32Array(xyArray),
					xArray: 		xArray, 
					yArray: 		yArray,
					xArrayDomain: 	d3.extent(xArray),
					yArrayDomain: 	d3.extent(yArray),
			}
		}

		static makebuffer_LineWidth_withZ(xname,yname,data,z){
			var xyArray=[], DirArray=[], Count=0, pred = data[0];
			for ( var d of data){
				Count++;
				var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
				xyArray.push(...onepiece.Vertex);
				DirArray.push(...onepiece.Dir);		
				pred = d;
			}
			return {
					Count: 			Count,
					buffer: 		new Float32Array(xyArray),
					Dirbuffer: 		new Float32Array(DirArray), 
			}
		}
		static fcn_onepieceRect(x1,y1,x2,y2,z){
			var dx = x2-x1, dy = y2 - y1;
			var ll = Math.sqrt(dx*dx+dy*dy);if (ll==0) ll=1;
			var vx = dx/ll,vy = dy/ll;
			return{
				Vertex: [
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x1, 	y1, 	z,
					x1, 	y1, 	z,
					x2, 	y2, 	z,
					x2, 	y2, 	z,
				],
				Dir: 	[ vy, -vx, 	vy, -vx,	-vy,  vx,	-vy,  vx,	 vy, -vx,	-vy,  vx]
			}
		}

		static build_dategroup_index(data){
			var monthgroup_index=[];
			var lasttick=-1;
			data.forEach(function(item,index){
				if (lasttick != item.date.getDate()) {
					if (monthgroup_index.length>0){
						monthgroup_index[monthgroup_index.length-1].push(index);
					}
					lasttick = item.date.getDate();
					monthgroup_index.push([]);
				}
				monthgroup_index[monthgroup_index.length-1].push(index);
			});
			return monthgroup_index;
		}

		static makebuffer_LineWidth_dately(xname,yname,data,z){
			var monthly_index = KIMGL_MPchart.build_dategroup_index(data);
			var xyArray1=[], DirArray1=[], Count1=0,ii=0;
			var xyArray2=[], DirArray2=[], Count2=0;
			var xyArray3=[], DirArray3=[], Count3=0;
			var pred;

			for(var index=0;index<monthly_index.length;index++){
				var onemonth = monthly_index[index];

				ii++;if(ii==3){ii=0} 
				if (ii==0){
					pred = data[onemonth[0]];
					for ( var iii of onemonth){
						Count1++;
						var d = data[iii];
						var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
						xyArray1.push(...onepiece.Vertex);
						DirArray1.push(...onepiece.Dir);		
						pred = d;
					}				
				}
				if (ii==1){
					pred = data[onemonth[0]];
					for ( var iii of onemonth){
						Count2++;
						var d = data[iii];
						var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
						xyArray2.push(...onepiece.Vertex);
						DirArray2.push(...onepiece.Dir);		
						pred = d;
					}				
				}
				if (ii==2){
					pred = data[onemonth[0]];
					for ( var iii of onemonth){
						Count3++;
						var d = data[iii];
						var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
						xyArray3.push(...onepiece.Vertex);DirArray3.push(...onepiece.Dir);
						pred = d;
					}				
				}
			};

			return {
					m1: {
							Count: 			Count1,
							buffer: 			new Float32Array(xyArray1),
							Dirbuffer: 		new Float32Array(DirArray1), 
					},
					m2: {
							Count: 			Count2,
							buffer: 			new Float32Array(xyArray2),
							Dirbuffer: 		new Float32Array(DirArray2),
					},
					m3:	{
							Count: 			Count3,
							buffer: 			new Float32Array(xyArray3),
							Dirbuffer: 		new Float32Array(DirArray3), 						
					}
			}
		}

		static makebuffer_LineWidth_dately_stripe(xname,yname,data,z){
			var monthly_index = KIMGL_MPchart.build_dategroup_index(data);
			var xyArray1=[], DirArray1=[], Count1=0,ii=0;
			var xyArray2=[], DirArray2=[], Count2=0;
			var pred;

			for(var index=0;index<monthly_index.length;index++){
				var onemonth = monthly_index[index];

				ii++;if(ii==2){ii=0} 
				if (ii==0){
					pred = data[onemonth[0]];
					for ( var iii of onemonth){
						Count1++;
						var d = data[iii];
						var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
						xyArray1.push(...onepiece.Vertex);
						DirArray1.push(...onepiece.Dir);		
						pred = d;
					}				
				}
				if (ii==1){
					pred = data[onemonth[0]];
					for ( var iii of onemonth){
						Count2++;
						var d = data[iii];
						var onepiece = KIMGL_SAchart.fcn_onepieceRect(pred[xname],pred[yname],d[xname],d[yname],z);
						xyArray2.push(...onepiece.Vertex);
						DirArray2.push(...onepiece.Dir);		
						pred = d;
					}				
				}
			};

			return {
					m1: {
							Count: 			Count1,
							buffer: 			new Float32Array(xyArray1),
							Dirbuffer: 		new Float32Array(DirArray1), 
					},
					m2: {
							Count: 			Count2,
							buffer: 			new Float32Array(xyArray2),
							Dirbuffer: 		new Float32Array(DirArray2),
					}
			}
		}	
	}

	class SVG_for_MPchart extends SVG_for_XY_Plane{
		constructor(motherDOM,canvas,glSide){
			super(motherDOM,canvas,glSide);

			this.targetCircle = this.svg_DOM
				.append("circle")
				.attr("r", 3)
				.style("fill", "steelblue");	
		}
		moveTargetCircle(x,y){
			this.targetCircle
				.attr("cx",this.zoomed_xScale(x) )
		        .attr("cy", this.zoomed_yScale(y) );		
		}
	}

// Define KIMLIB_GLSVG_Chart_base & KIMLIB_DK_M5_MP_SA = { KIMLIB_DKchart, KIMLIB_M5chart, KIMLIB_MPchart, KIMLIB_SAchart }
	class KIMLIB_GLSVG_Chart_base{
		constructor(motherDOM,x,y,w,h,stock,brushPad,shader){
			this.motherDOM = motherDOM;
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
			this.stock = stock;
			this.brushPad = brushPad;
			this.shader = shader;

			this.canvas = document.createElement("canvas");
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.canvas.style.position = "absolute";
			this.canvas.style.top = this.y + "px";
			this.canvas.style.left = this.x + "px";
			this.motherDOM.appendChild(this.canvas);

			this.ChartType();
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

			this.chart.SVGonCanvas.resize();

			this.chart.Draw();
		}
	}

	class KIMLIB_DKchart extends KIMLIB_GLSVG_Chart_base{
		ChartType(){
			this.chart = new KIMGL_Candlechart(this.stock,"DK",this.motherDOM,this.canvas,this.brushPad,this.shader);
			this.chart.Draw();
			this.brushPad.pushchild(this.chart);			
		}
	}

	class KIMLIB_M5chart extends KIMLIB_GLSVG_Chart_base{
		ChartType(){
			this.chart = new KIMGL_Candlechart(this.stock,"M5",this.motherDOM,this.canvas,this.brushPad,this.shader);
			this.brushPad.pushchild(this.chart);

	  //   	this.chart.Model1 = new simplelineShape(
			// 	this.stock.M5,
			// 	this.brushPad.sh_xScale,
			// 	["MODEL1"],
			// 	[0xFFFFFF]
			// );	

	    	this.chart.ZJM5 = new simplelineShape(
				this.stock.ZJM5,
				this.brushPad.sh_xScale,
				["ZJM5"],
				[0xFF00FF]
			);	

			this.chart.drawfcn.push(function(t){t.draw_Model1();});	
			this.chart.drawfcn.push(function(t){t.draw_ZJM5();});	
			this.chart.Draw();
		}
	}

	class KIMLIB_MPchart extends KIMLIB_GLSVG_Chart_base{
		ChartType(){
			KIM_Tools.MA(15, this.stock.M5, "MODEL1");
			this.chart = new KIMGL_MPchart(this.stock,this.motherDOM,this.canvas,this.brushPad,this.shader);

		 //    this.chart.Model1 = KIMGL_IndexLine_withZ(this.stock.M5,"MODEL1",this.brushPad.sh_xScale,2);
		 //    this.chart.ZJM5 = KIMGL_IndexLine_withZ(this.stock.ZJM5,"ZJM5",this.brushPad.sh_xScale,2);
			// this.chart.drawfcn.push(function(t){t.draw_Model1();});	
			// this.chart.drawfcn.push(function(t){t.draw_ZJM5();});	
			this.chart.Draw();
		}
	}

	class KIMLIB_SAchart extends KIMLIB_GLSVG_Chart_base{
		ChartType(){
			this.chart = new KIMGL_SAchart(this.stock,this.motherDOM,this.canvas,this.brushPad,this.shader);
			this.chart.Draw();
		}
	}

	class KIMLIB_DK_M5_MP_SA{
		constructor(stock,motherDOM,brushPad,x,y,w,h,shders){
			this.stock = stock;

			this.motherDOM = motherDOM;
			this.brushPad = brushPad;	
			this.shders = shders;
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;	

			this.margin = 3;
			this.candleWidth = this.width - this.height - this.margin-this.height/2 - this.margin;
			this.candleHeight = (this.height - this.margin)/2 ;


	        this.DKchart = new KIMLIB_DKchart(this.motherDOM,this.x + this.margin,this.y,this.candleWidth,this.candleHeight,
	            this.stock,
	            this.brushPad.DK_brush,
	            this.shders.DK
	        );

	        this.M5chart = new KIMLIB_M5chart(this.motherDOM,this.x + this.margin,this.y+ this.candleHeight+this.margin,this.candleWidth,this.candleHeight,
	            this.stock,
	            this.brushPad.M5_brush,
	            this.shders.M5
	        );

	        this.MPchart = new KIMLIB_MPchart(this.motherDOM,this.x + this.margin*2 +this.candleWidth  ,this.y,this.height,this.height,
	            this.stock,
	            this.brushPad.M5_brush,
	            this.shders.MP
	        );
	        this.M5chart.chart.SVGonCanvas.MP = this.MPchart.chart;

	        this.SAchart = new KIMLIB_SAchart(this.motherDOM,this.x + this.margin*3 +this.candleWidth + + this.height,this.y,this.height/2,this.height,
	            this.stock,
	            this.brushPad.M5_brush,
	            this.shders.MP
	        );
		}
		resize(x,y,w,h){
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;	
			this.candleWidth = this.width - this.height - this.margin-this.height/2 - this.margin;
			this.candleHeight = (this.height - this.margin)/2 ;

			this.DKchart.resize(this.x + this.margin,this.y,this.candleWidth,this.candleHeight);
			this.M5chart.resize(this.x + this.margin,this.y+ this.candleHeight+this.margin,this.candleWidth,this.candleHeight);
			this.MPchart.resize(this.x + this.margin*2 +this.candleWidth  ,this.y,this.height,this.height);
			this.SAchart.resize(this.x + this.margin*3 +this.candleWidth + + this.height,this.y,this.height/2,this.height);
		}
		update_TDY(nTDY){
	            this.stock.load_TDY(nTDY);
	            this.DKchart.chart.update_TDY();
	            this.M5chart.chart.update_TDY();	
	            this.SAchart.chart.update_TDY();	
	            this.MPchart.chart.update_TDY();	

		}
	}

// Define TDY/   TDY_DK,
	class TDY_DK{
		static getTDYPaser(datePaser){
			return function(d){
				  return {
				  	IDE: 	  d.IDE,
				    date:     datePaser(d.DATE),
				    open:     +d.OPEN,
				    high:     +d.HIGH,
				    low:      +d.LOW,
				    close:    +d.CLOSE,
				    volume:   +d.VOLUME,
				    amount:   +d.AMOUNT,
				    AVP15: 	  +d.AVP15,
				    AVP30: 	  +d.AVP30,
				    AVP60: 	  +d.AVP60,
				    AVP120:   +d.AVP120,
				    AVP240:	  +d.AVP240,
				    SHC15: 	  +d.SHC15,
				    SHC30: 	  +d.SHC30,
				    SHC60: 	  +d.SHC60,
				    SHC120:   +d.SHC120,
				    SHC240:	  +d.SHC240,
	    			MODEL1:   +d.MODEL1, 
	    			ZJM5: 	  +d.ZJM5, 			    
				  }
			}
		};	
		constructor(){
			this.csvURL_DK = "../B001/TDY/DK.csv";
			this.csvURL_M5 = "../B001/TDY/M5.csv";

		}
		update(){
			var t = this;
			this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText)
				.map(TDY_DK.getTDYPaser(d3.timeParse("%Y-%m-%d")));
			this.M5 = d3.csvParse($.ajax({ async: false, url: t.csvURL_M5}).responseText)
				.map(TDY_DK.getTDYPaser(d3.timeParse("%Y-%m-%d %H:%M:%S")));

			console.log("data update finished !");
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
		}
	}
