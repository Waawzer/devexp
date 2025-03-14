/**
 * Compresse une image avant de l'envoyer au serveur
 * @param file Le fichier image à compresser
 * @param maxSizeMB Taille maximale en MB (par défaut 4MB pour Vercel)
 * @param maxWidth Largeur maximale de l'image (par défaut 1200px)
 * @returns Promise<File> Le fichier compressé
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 4,
  maxWidth: number = 1200
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, retourner le fichier tel quel
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Si l'image est déjà plus petite que la taille maximale, retourner le fichier tel quel
    if (file.size <= maxSizeMB * 1024 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculer les dimensions pour respecter maxWidth
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        // Créer un canvas pour la compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Impossible de créer le contexte canvas'));
        }
        
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Qualité de compression initiale
        let quality = 0.8;
        
        // Fonction pour compresser avec une qualité donnée
        const compressWithQuality = (q: number) => {
          // Convertir en Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error('Échec de la compression'));
              }
              
              // Si la taille est encore trop grande et qu'on peut encore réduire la qualité
              if (blob.size > maxSizeMB * 1024 * 1024 && q > 0.2) {
                // Réduire la qualité et réessayer
                compressWithQuality(q - 0.1);
              } else {
                // Créer un nouveau fichier
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                
                resolve(compressedFile);
              }
            },
            file.type,
            q
          );
        };
        
        // Démarrer la compression
        compressWithQuality(quality);
      };
      
      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
  });
} 