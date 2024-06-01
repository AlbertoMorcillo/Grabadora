const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');
const deleteAllButton = document.getElementById('delete-all');
const listaArchivos = document.getElementById('lista-archivos');
const recordingIndicator = document.getElementById('recording-indicator');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const confirmDeleteAllButton = document.getElementById('confirmDeleteAllButton');
const paginationContainer = document.getElementById('pagination-container');
let mediaRecorder;
let audioChunks = [];
let audioElement = null;
let archivoAEliminar;
let updateIntervalId;

let currentPage = 1;
const pageSize = 10;

// Intervalo de tiempo para actualizar la lista de archivos (en milisegundos)
const updateInterval = 5000; // 5 segundos

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

deleteAllButton.addEventListener('click', () => {
  $('#confirmDeleteAllModal').modal('show');
});

confirmDeleteAllButton.addEventListener('click', () => {
  fetch(`/api/archivos`, {
    method: 'DELETE'
  }).then(() => {
    $('#confirmDeleteAllModal').modal('hide');
    actualizarListaArchivos(currentPage);
  });
});

function actualizarListaArchivos(page = 1) {
  fetch(`/api/archivos?page=${page}&pageSize=${pageSize}`)
    .then(response => response.json())
    .then(data => {
      const { archivos, total } = data;
      listaArchivos.innerHTML = '';
      archivos.forEach(archivo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        const span = document.createElement('span');
        span.textContent = archivo.name;
        span.classList.add('nombre-archivo');
        li.appendChild(span);

        const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');

        const btnReproducir = document.createElement('button');
        btnReproducir.innerHTML = '<i class="fas fa-play"></i>';
        btnReproducir.classList.add('btn', 'btn-success', 'ml-2');
        btnReproducir.addEventListener('click', () => {
          if (audioElement && !audioElement.paused) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement = null;
          }
          fetch(`/api/archivos/${archivo.id}`)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              audioElement = new Audio(url);
              audioElement.play();
              span.textContent = `${archivo.name} (Reproduciendo...)`;

              audioElement.addEventListener('ended', () => {
                span.textContent = archivo.name;
              });

              audioElement.addEventListener('pause', () => {
                if (audioElement.currentTime === audioElement.duration) {
                  span.textContent = archivo.name;
                } else {
                  span.textContent = `${archivo.name} (Pausado)`;
                }
              });
            });
        });
        btnGroup.appendChild(btnReproducir);

        const btnPausar = document.createElement('button');
        btnPausar.innerHTML = '<i class="fas fa-pause"></i>';
        btnPausar.classList.add('btn', 'btn-warning', 'ml-2');
        btnPausar.addEventListener('click', () => {
          if (audioElement && !audioElement.paused) {
            audioElement.pause();
          }
        });
        btnGroup.appendChild(btnPausar);

        const btnDetener = document.createElement('button');
        btnDetener.innerHTML = '<i class="fas fa-stop"></i>';
        btnDetener.classList.add('btn', 'btn-danger', 'ml-2');
        btnDetener.addEventListener('click', () => {
          if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            span.textContent = archivo.name;
            audioElement = null;
          }
        });
        btnGroup.appendChild(btnDetener);

        const btnBorrar = document.createElement('button');
        btnBorrar.innerHTML = '<i class="fas fa-trash"></i>';
        btnBorrar.classList.add('btn', 'btn-danger', 'ml-2');
        btnBorrar.addEventListener('click', () => {
          archivoAEliminar = archivo.id;
          $('#confirmDeleteModal').modal('show');
        });
        btnGroup.appendChild(btnBorrar);

        li.appendChild(btnGroup);
        listaArchivos.appendChild(li);
      });

      // Actualizar la paginación
      actualizarPaginacion(total, page, pageSize);
    });
}

function actualizarPaginacion(total, currentPage, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('btn', 'btn-primary', 'ml-1', 'mr-1');
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.addEventListener('click', () => {
      actualizarListaArchivos(i);
    });
    paginationContainer.appendChild(pageButton);
  }
}

confirmDeleteButton.addEventListener('click', () => {
  fetch(`/api/archivos/${archivoAEliminar}`, {
    method: 'DELETE'
  }).then(() => {
    $('#confirmDeleteModal').modal('hide');
    actualizarListaArchivos(currentPage);
  });
});

// Actualizar la lista de archivos automáticamente cada cierto intervalo
updateIntervalId = setInterval(() => actualizarListaArchivos(currentPage), updateInterval);

// Actualizar la lista de archivos al cargar la página
actualizarListaArchivos(currentPage);
