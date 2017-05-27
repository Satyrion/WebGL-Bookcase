window.onload = function(){

	const PI = Math.PI;

	var scene = new THREE.Scene();
	
	var books = {};
	var shelf = new THREE.Mesh();

	//cubemap
	var urls = [
		'img/cubemap/px.jpg', 'img/cubemap/nx.jpg',
		'img/cubemap/py.jpg', 'img/cubemap/ny.jpg',
		'img/cubemap/pz.jpg', 'img/cubemap/nz.jpg'
	];

	var booksPdf = [
		'pdf/webgl-programmirovanie-trehmernoy-grafiki.pdf',
		'pdf/Packt.Lear.2nd.Edition.Mar.2015.ISBN.1784392219.pdf',
		'pdf/grafika-na-javascript.pdf',
		'pdf/Джон Дакетт - HTML и CSS. Разработка и дизайн веб-сайтов (2013).pdf',
		'pdf/professional+webgl+programming.pdf',
		'pdf/WebGL Programming Guide.pdf',
		'pdf/English for Information Technology 1.pdf',
		'pdf/English for Information Technology 2.pdf',
		'pdf/eloquentjavascript_ru.pdf',
		'pdf/javascript-dlya-professionalnyih-veb-razrabotchikov.pdf',
		'pdf/Learning_JavaScript.pdf',
		'pdf/Veb-prilozhenia_na_JavaScript_2012_Makkou_A.pdf',
		'pdf/meteor.pdf',
		'pdf/sassdocs-fe-edition.pdf',
		'pdf/Стоян Стефанов - JavaScript. Шаблоны - 2011.pdf',
		'pdf/vvedenie-v-ecmascript-6.pdf'
	]

	var cubeMap = new THREE.CubeTextureLoader().load(urls);
	cubeMap.format = THREE.RGBFormat;

	scene.background = cubeMap;
	var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
	camera.position.z = 80;
	camera.position.y = 60;
	camera.lookAt(new THREE.Vector3( 0, 30, 0 ));

	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	document.body.appendChild( renderer.domElement );

	var pointLight = new THREE.PointLight( 0xC1C1C1 );
	pointLight.position.set(30,25,100);
	pointLight.castShadow = true;
	var pointLight2 = new THREE.PointLight( 0xC1C1C1 );
	pointLight2.position.set(-50,50,100);
	pointLight2.castShadow = true;
	//scene.add(pointLight2);
	scene.add(pointLight);
	var ambientLight = new THREE.AmbientLight( 0xffffff);
	ambientLight.position.set(0,10,0);
	scene.add(ambientLight);


	/*		TEXT 		*/

	function createText(text){

		if(scene.getObjectByName("text")){
			scene.remove(scene.getObjectByName("text"));
		}


		var loader = new THREE.FontLoader().load("fonts/droid_sans_mono_regular.typeface.json",function(font){

		

		var TopText = new THREE.Mesh(new THREE.TextGeometry(text,{
			font: font,
			size: 0.9,
			height: 0.5,
			curveSegments: 10,
			//bevelEnabled: false
		}), new THREE.MeshBasicMaterial({color: 0xBABABA}));

		TopText.geometry.computeBoundingBox();
		var centerOffset = -0.5 * ( TopText.geometry.boundingBox.max.x - TopText.geometry.boundingBox.min.x );

		TopText.position.set(centerOffset,51,5);
		TopText.name = "text";
		TopText.castShadow = true;
		scene.add(TopText);
		console.log(TopText);
	});
	};

	//createText("Select a book");




	for (var j = 0; j < 4; j++){
		for (var i = 0; i < 4; i++){
			books[j*4+i] = new THREE.Mesh();
			initBookObj('models/textures/book'+ (j*4+i+1) + '.jpg', books[j*4+i]);
			books[j*4+i].rotation.set(0,PI/6,0);
			books[j*4+i].position.set(-15+(i*10), 17.8-(12.25*j), 0);
			books[j*4+i].castShadow = true;
			books[j*4+i].resiveShudow = true;
			books[j*4+i].number = j*4+i;
		}
	}

	console.log(shelf.children);

	//books loader
	function initBookObj(pathToImg,obj){
		var bookTexture = new THREE.TextureLoader().load(pathToImg);
		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.load('models/book.mtl', function(materials){
	 	materials.preload();
	 	var objLoader = new THREE.OBJLoader();
	 	objLoader.setMaterials(materials);
	 		objLoader.load('models/book.obj', function(object){
	 			object.traverse(function(child){
	 				if (child instanceof THREE.Mesh)
	 				{
	 					obj.geometry = child.geometry;
	 					obj.material = child.material;
	 					obj.material.materials[0].map = bookTexture;
	 				}
	 			});
	 			shelf.add(obj);
	 		});
		});
	}

	shelf.castShadow = true;
	shelf.receiveShadow = true;
	
	//loaded shelf for books
	var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setBaseUrl = 'models/';
		mtlLoader.setPath = '/models/';
			mtlLoader.load('models/shelf.mtl', function(materials){
		 	materials.preload();
		 	var objLoader = new THREE.OBJLoader();
		 	objLoader.setMaterials(materials);
		 	objLoader.setPath = '/models/';
		 		objLoader.load('models/shelf.obj', function(object){
		 			object.traverse(function(child){
		 				if (child instanceof THREE.Mesh)
		 				{
		 					shelf.geometry = child.geometry;
		 					shelf.material = child.material;
		 				}
		 			});
		 		});
			});


	shelf.position.y +=27;
	//console.log(shelf);
	scene.add(shelf);

	var posY = 0, posX = 0;
	function keyControl(){
		document.onkeydown = function(e){
			var step = 0.05;
			switch(e.keyCode){
				case 37: posX -=step; break;
				//case 38: posY +=step; break;
				case 39: posX +=step; break;
				//case 40: posY -=step; break;
			}
			//book.rotation.y += posX;
			//book2.rotation.y += posX;
			shelf.rotation.y += posX;
			posY = posX = 0;
		}
	}


	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	//select books
	window.addEventListener( 'mousemove', onMouseMove, false );

	window.addEventListener( 'resize', onWindowResize, false );
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	function onMouseMove( event ) {
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		//rotation camera
			camera.position.x = (event.clientX - window.innerWidth / 2 ) * 0.01;
			camera.position.y = 40+ (event.clientY - window.innerHeight / 2 ) * -0.01;
			camera.lookAt(new THREE.Vector3( 0, 30, 0 ));

		//rotating books
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( shelf.children );
		for (var i = 0; i < shelf.children.length; i++){
			if(shelf.children[i].position.z === 0){
				shelf.children[i].rotation.set(0,PI/6,0);
				document.body.style.cursor = "";
			}
		}

		for ( var i = 0; i < intersects.length; i++ ) {
			intersects[i].object.rotation.set(0,0,0);
			document.body.style.cursor = "pointer";
		}
	}

	setTimeout(function (){
		document.getElementById('loading').style.display = "none";
	},2000)

	//click on the books
	window.addEventListener('click', onMouseDown, false);
	function onMouseDown ( event ) {
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( shelf.children );
		document.getElementById("pdf-window").style.display = "none";
		document.getElementById("pdf-window").src = null;
		if(scene.getObjectByName("text")){
			scene.remove(scene.getObjectByName("text"));
		}


		for ( var i = 0; i < intersects.length; i++ ) {
			if(intersects[i].object.position.z != 0){
				document.getElementById("pdf-view").src = booksPdf[intersects[i].object.number];
				document.getElementById("pdf-window").style.display = "block";
			}
			//createText("");
		}

		document.getElementById('text-help').innerHTML = "Выбирите книгу для просмотра!";
		for(var i=0; i < shelf.children.length; i++){
			shelf.children[i].position.z = 0;
			//createText("");
			
		}

		//createText("");

		for ( var i = 0; i < intersects.length; i++ ) {
			intersects[i].object.position.z +=5;
			document.getElementById('text-help').innerHTML = "Нажмите на книгу еще раз для чтения!";
			
			//file name to text
			createText((booksPdf[intersects[i].object.number]).substring(4,(booksPdf[intersects[i].object.number]).length - 4));
		}
	}

	//var controls = new THREE.TrackballControls( camera );
	//controls.rotateSpeed *=5;
	//controls.noPan = true;

	function render(){
		requestAnimationFrame(render);
		//controls.update();
		//keyControl();

		renderer.render(scene,camera);
	}
	render();
}
