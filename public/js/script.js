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
          organizedFiles.forEach(({file, name}) => {           
            formData.append('mp3Files', file, name)
          })
          const response = await fetch('/upload', {
            method: 'POST',          
            body: formData,
          });
    
          if (!response.ok) {
            throw new Error('Error organizing files');
          }
    
          const data = await response.json();
          console.log(data); 
        } catch (error) {
          console.error('Error:', error);
          // Handle error display or other actions
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
      
          // Update the items' data-index attributes after reordering
          items.forEach((item, index) => {
            item.setAttribute('data-index', index);
          });
      
          // Update the filesArray based on the new order
          const [removed] = filesArray.splice(sourceIndex, 1);
          filesArray.splice(newIndex, 0, removed);
      
          // Update the displayed list in the UI to reflect the reordering
          // Remove all items from the fileList
          fileList.innerHTML = '';
      
          // Re-create the list items based on the updated filesArray
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
      
          console.log('Source Index:', sourceIndex);
          console.log('New Index:', newIndex);
          console.log('Target Index:', targetIndex);
          console.log('filesArray:', filesArray);
        }
      });

      document.getElementById('organizeButton').addEventListener('click', async () => {
        
        const organizedFiles = [];
    
        for (const file of filesArray) {
          const { artist , title } = await extractMetadata(file)
          const cleanedName = file.name.replace('[SPOTIFY-DOWNLOADER.COM]', '').trim();
          // Add your logic here to organize files and structure them
          // For this example, just a simple structure is created
          organizedFiles.push({ name: cleanedName, destination: `uploads/organized/${artist}/${title}` });
        }
        console.log("organizedFiles:    " , organizedFiles)
        // Send the organized files to the server for processing
        organizeFiles(organizedFiles);
      });
    // You can add more logic here to handle organizing the files
    // and interacting with the backend for processing and creating folders.
  });