const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');
const listaArchivos = document.getElementById('lista-archivos');
let mediaRecorder;
let audioChunks = [];

recordButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const formData = new FormData();
        formData.append('archivo', audioBlob, 'grabacion.wav');
        fetch('/api/archivos', {
          method: 'POST',
          body: formData
        }).then(() => {
          actualizarListaArchivos();
        });
        audioChunks = [];
      });
    });
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  recordButton.disabled = false;
  stopButton.disabled = true;
});

function actualizarListaArchivos() {
  fetch('/api/archivos')
    .then(response => response.json())
    .then(archivos => {
      listaArchivos.innerHTML = '';
      archivos.forEach(archivo => {
        const li = document.createElement('li');
        li.textContent = archivo.name;
        li.appendChild(crearBotonDescargar(archivo.id));
        li.appendChild(crearBotonBorrar(archivo.id));
        listaArchivos.appendChild(li);
      });
    });
}

function crearBotonDescargar(id) {
  const boton = document.createElement('button');
  boton.textContent = 'Reproducir';
  boton.addEventListener('click', () => {
    fetch(`/api/archivos/${id}`)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      });
  });
  return boton;
}

function crearBotonBorrar(id) {
  const boton = document.createElement('button');
  boton.textContent = 'Borrar';
  boton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres borrar este archivo?')) {
      fetch(`/api/archivos/${id}`, {
        method: 'DELETE'
      }).then(() => {
        actualizarListaArchivos();
      });
    }
  });
  return boton;
}

actualizarListaArchivos();
