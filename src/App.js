import React from 'react';
import './App.css';
import * as THREE from 'three';

// import { PI2 } from './utils/constants';
import isEmpty from './utils/isEmpty';

// AudioContext
// var ctx = new (window.AudioContext || window.webkitAudioContext)(); // creates audioNode
// var analyser = ctx.createAnalyser(); // creates analyserNode
import { ctx, analyser } from './utils/getAnalyser';

// ThreeJS
var camera, scene, renderer;
var particles = [];
var circleCounter;

// CORS
var corsProxy = 'https://cors-anywhere.herokuapp.com/';

var settings = {
  R: 0.7,
  G: 0,
  B: 0.7,
  fov: 50,
  radius: 35,
  intensity: 0.06,
  dotSize: 0.2
};

class App extends React.Component {
  state = {
    source: {},
    audioURLS: [
      // 'https://a.clyp.it/cwvlsmnd.mp3',
      // 'https://a.clyp.it/jagqtd5f.mp3',
      // 'https://a.clyp.it/ybjw5or0.mp3',
      "https://audio.clyp.it/zha0rxwk.mp3?Expires=1578793822&Signature=Y4pvv3F3SKWiou8ZHqri6tPV-Tx8CY6y1Vsa8vA2g8wNXHqKtdBOYnktAEYhEyltvHjQqbcvMSnmCRYJ50DJFWxnUDFLhZKfOHGiqE0mbBm8fchj28mJifbQEqGnRlnJWwpQsg68ivdXWFcLNe~TsQuxyEAwyDCwGQMgei9hKX4_&Key-Pair-Id=APKAJ4AMQB3XYIRCZ5PA"
    ],
    audioIndex: 0
  };

  componentDidMount() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    const cameraSettings = {
      fov: 1
    };

    camera = new THREE.PerspectiveCamera(
      cameraSettings.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 0.2, 175);

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set Color
    renderer.setClearColor(0x000000, 0);

    // Create Canvas in HTML imperatively
    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    this.poop.appendChild(renderer.domElement);

    // Set up Particles Geometry
    let particle;
    for (let i = 0; i <= 2048; i++) {
      // CircleGeometry
      // var geo = new THREE.CircleGeometry(settings.dotSize, 26);
      // var mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      // particle = particles[i++] = new THREE.Mesh(geo, mat);

      // Sprite
      var spriteMaterial = new THREE.SpriteMaterial({
        color: 0xffffff,
      });

      // var material = new THREE.SpriteMaterial({
      //   map: new THREE.CanvasTexture(this.generateSprite()),
      //   blending: THREE.AdditiveBlending
      // });

      particle = particles[i++] = new THREE.Sprite(spriteMaterial);
      particle.scale.set(1, 1, 1);

      scene.add(particle);
    }

    // // Test Cube Geometry
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff00ff
    // });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // Audio index init
    const audioIndex = Math.floor(Math.random() * this.state.audioURLS.length);

    // Set State
    this.setState(
      {
        audioIndex
      },
      () => {
        // console.log(particles)
        this.animate();
        renderer.render(scene, camera);
      }
    );
  }

  generateSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 16*4;
    canvas.height = 16*4;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    // gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,0,1)');
    gradient.addColorStop(0.4, 'rgba(255,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    this.animateParticles();
    this.changeCircleRadius();

    // camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };

  changeCircleRadius() {
    if (circleCounter) {
      settings.radius += 0.05;
      if (settings.radius >= 65) {
        circleCounter = false;
      }
    } else {
      settings.radius -= 0.05;
      if (settings.radius <= 35) {
        console.log('hit');
        circleCounter = true;
      }
    }
  }

  animateParticles() {
    const { radius, intensity } = settings;
    // const { particles } = this.state;

    // //   // Old Test Cube stuff
    // const { cube } = this.state;
    // cube.rotation.x += 0.01;
    // cube.rotation.z += 0.01;

    const timeByteData = new Uint8Array(analyser.fftSize);
    const timeFloatData = new Float32Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeByteData);
    analyser.getFloatTimeDomainData(timeFloatData);

    for (let j = 0; j <= particles.length; j++) {
      let particle = particles[j++];

      // COLOR
      const R = settings.R + timeFloatData[j];
      const G = settings.G - timeFloatData[j];
      const B = settings.B - timeFloatData[j];
      particle.material.color.setRGB(R, G, B);

      // POSITION
      particle.position.x = Math.sin(j) * (j / (j / radius));
      particle.position.y = timeFloatData[j] * timeByteData[j] * intensity;
      particle.position.z = Math.cos(j) * (j / (j / radius));
      camera.position.y = 35;
    }
    camera.fov = settings.fov;
    camera.updateProjectionMatrix();
  }

  handleClick = e => {
    e.preventDefault();

    if (isEmpty(this.audio.src)) {
      this.initiateAudio(); // initiates audio from the dropped file
      this.setupAudioHandlers();
    } else if (!this.audio.paused) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  };

  initiateAudio() {
    // Load src
    this.audio.src = this.getURL();
    this.audio.load();
    this.audio.play();

    // Cors
    this.audio.crossOrigin = 'anonymous';

    const source = ctx.createMediaElementSource(this.audio); // creates audio source
    source.connect(ctx.destination); // connects the audioNode to the audioDestinationNode (computer speakers)
    source.connect(analyser); // connects the analyser node to the audioNode and the audioDestinationNode

    this.setState(
      {
        source
      },
      () => console.log(this.state)
    );
    this.animate();
  }

  setupAudioHandlers() {
    this.audio.addEventListener('play', () => {
      // alert("play")
      console.log('PLAY event');
    });

    this.audio.addEventListener('ended', () => {
      console.log('ENDED event');
      // Force call initiateAudio to "replay" the song
      this.audio.src = this.getURL();
      this.audio.load();
      this.audio.play();
    });
  }

  getURL() {
    let { audioIndex, audioURLS } = this.state;
    audioIndex++;
    if (audioIndex >= audioURLS.length) {
      audioIndex = 0;
    }
    this.setState({ audioIndex });
    return corsProxy + audioURLS[audioIndex];
  }

  render() {
    return (
      <div className="god" style={{ zIndex: 100 }} onClick={this.handleClick}>
        <div onDrop={this.handleDrop} ref={ref => (this.poop = ref)} />
        <audio ref={ref => (this.audio = ref)} />
      </div>
    );
  }
}

export default App;
