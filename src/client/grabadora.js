const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');
const listaArchivos = document.getElementById('lista-archivos');
const recordingIndicator = document.getElementById('recording-indicator');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
let mediaRecorder;
let audioChunks = [];
let archivoAEliminar;

recordButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;
      recordingIndicator.classList.remove('d-none');

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
        recordingIndicator.classList.add('d-none');
      });
    });
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  recordButton.disabled = false;
  stopButton.disabled = true;
  recordingIndicator.classList.add('d-none');
});

function actualizarListaArchivos() {
  fetch('/api/archivos')
    .then(response => response.json())
    .then(archivos => {
      listaArchivos.innerHTML = '';
      archivos.forEach(archivo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        const span = document.createElement('span');
        span.textContent = archivo.name;
        span.classList.add('nombre-archivo');
        li.appendChild(span);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = archivo.name;
        input.classList.add('form-control', 'd-none');
        li.appendChild(input);

        const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');

        const btnReproducir = document.createElement('button');
        btnReproducir.textContent = 'Reproducir';
        btnReproducir.classList.add('btn', 'btn-success', 'ml-2');
        btnReproducir.addEventListener('click', () => {
          fetch(`/api/archivos/${archivo.id}`)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const audio = new Audio(url);
              audio.play();
            });
        });
        btnGroup.appendChild(btnReproducir);

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn', 'btn-warning', 'ml-2');
        btnEditar.addEventListener('click', () => {
          span.classList.add('d-none');
          input.classList.remove('d-none');
          input.focus();
        });
        btnGroup.appendChild(btnEditar);

        const btnGuardar = document.createElement('button');
        btnGuardar.textContent = 'Guardar';
        btnGuardar.classList.add('btn', 'btn-primary', 'ml-2', 'd-none');
        btnGuardar.addEventListener('click', () => {
          fetch(`/api/archivos/${archivo.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: input.value })
          }).then(() => {
            actualizarListaArchivos();
          });
        });
        btnGroup.appendChild(btnGuardar);

        input.addEventListener('blur', () => {
          span.classList.remove('d-none');
          input.classList.add('d-none');
          btnGuardar.classList.add('d-none');
          btnEditar.classList.remove('d-none');
        });

        input.addEventListener('input', () => {
          btnGuardar.classList.remove('d-none');
          btnEditar.classList.add('d-none');
        });

        const btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Borrar';
        btnBorrar.classList.add('btn', 'btn-danger', 'ml-2');
        btnBorrar.addEventListener('click', () => {
          archivoAEliminar = archivo.id;
          $('#confirmDeleteModal').modal('show');
        });
        btnGroup.appendChild(btnBorrar);

        li.appendChild(btnGroup);
        listaArchivos.appendChild(li);
      });
    });
}

confirmDeleteButton.addEventListener('click', () => {
  fetch(`/api/archivos/${archivoAEliminar}`, {
    method: 'DELETE'
  }).then(() => {
    $('#confirmDeleteModal').modal('hide');
    actualizarListaArchivos();
  });
});

actualizarListaArchivos();
