document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('dropArea');
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileInput');
    
    let filesArray = [];

    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'blue';
    });

    dropArea.addEventListener('dragleave', () => {
      dropArea.style.borderColor = '#ccc';
    });

    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = '#ccc';

      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    dropArea.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      handleFiles(files);
    });

    fileList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const activeItem = document.elementFromPoint(e.clientX, e.clientY);
    if (activeItem && activeItem !== fileList) {
        fileList.insertBefore(draggedItem, activeItem);
    }
    });


    function handleFiles(files) {
    console.log("function is happening")
       for (let i = 0; i < files.length; i++){

        const file = files[i];
        filesArray.push(file);
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        listItem.draggable = true;
        listItem.setAttribute('data-index', i);

        listItem.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', file.name);
          draggedItem = listItem;
        });


        fileList.appendChild(listItem)
       }
      }


      async function organizeFiles(organizedFiles) {
        try {
          const formData = new FormData();
          console.log(formData)
          await Promise.all(
            organizedFiles.map(async ({ name }, index) => {
              formData.append("mp3Files", filesArray[index], name);
            })
          );

          for (const entry of formData.entries()) {
            console.log("what is this       ", entry[1].name);
            
          }
          console.log( "the formdatabeing sent to the backend", formData);
          
          const response = await fetch("/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Error organizing files");
          }

          const data = await response.json();
          let newData = new Object();
          newData = data

          console.log("files organized", newData.organizedFiles);
         

          const songList = newData.organizedFiles
          songList.forEach((song) => {
            console.log(song.originalName)
          })
      
            // for (var i = 0; i < data.organizedFiles.length; i++){
            //   console.log(data.organizedFiles[i])
            // }
        
         

        } catch (error) {
          console.error("Error:", error);
        }
      }
    
      function extractMetadata(file) {
        return new Promise((resolve, reject) => {
          jsmediatags.read(file, {
            onSuccess: function (tag) {
              const artist = tag.tags.artist || 'Unknown Artist';
              const title = tag.tags.title || 'Unknown Title';
              resolve({ artist, title });
            },
            onError: function (error) {
              reject(error);
            }
          });
        });
      }  
      
      
      fileList.addEventListener('drop', (e) => {
        e.preventDefault();
        const activeItem = document.elementFromPoint(e.clientX, e.clientY);
        if (activeItem && activeItem !== fileList) {
          const sourceIndex = parseInt(draggedItem.getAttribute('data-index'));
          const targetIndex = parseInt(activeItem.getAttribute('data-index'));
      
          const items = [...fileList.getElementsByTagName('li')];
          const sourceItem = items[sourceIndex];
          const targetItem = items[targetIndex];
      
          fileList.insertBefore(draggedItem, targetItem.nextSibling);
      
          const newIndex = items.indexOf(draggedItem);
      
    
          items.forEach((item, index) => {
            item.setAttribute('data-index', index);
          });
      
         
          const [removed] = filesArray.splice(sourceIndex, 1);
          filesArray.splice(newIndex, 0, removed);
      
         
          fileList.innerHTML = '';
      
          filesArray.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            listItem.draggable = true;
            listItem.setAttribute('data-index', index);
      
            listItem.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', file.name);
              draggedItem = listItem;
            });
      
            fileList.appendChild(listItem);
          });          
        }
      });

      document.getElementById('organizeButton').addEventListener('click', async (event) => {
        event.preventDefault();
        
        const organizedFiles = [];
    
        for (const file of filesArray) {
          const { artist , title } = await extractMetadata(file)
          const cleanedName = file.name.replace('[SPOTIFY-DOWNLOADER.COM]', '').trim();
       
          organizedFiles.push({ name: cleanedName, destination: `uploads/organized/${artist}/${title}` });
        }
        console.log("organizedFiles gueyyyy:    " , organizedFiles)
       
        organizeFiles(organizedFiles);
      });




      async function clearUploads(event) {
        event.preventDefault()
        console.log("click")
        try {
          const response = await fetch('/uploads', {
            method: 'DELETE'
          });
    
          if(response.ok){
            const notification = document.querySelector(".notificaton")
            const message = `<p>Uploads Clear</p>`
            notification.innerHTML = message
            setTimeout(()=> {
              notification.innerHTML = ''
            },1000)
          }
    
          const data = await response.json()
          console.log(data)
        } catch (error) {
          console.error(error)
        }
      }


      document.querySelector('#clear').addEventListener("click", clearUploads)

  });


 


  