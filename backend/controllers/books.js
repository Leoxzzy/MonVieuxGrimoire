const book = require('../models/book'); /* model de base de données concernant les livres */
const fs = require('fs'); /* gestion de fichiers */
const path = require('path'); /* gestion de chemins de fichiers */



// Fonction permettant l'utilisation d'une fonction / promesse. 
async function usePromise(promise) {
    try {
        const response = await promise
        console.log(response)
    } catch(error) {
        console.error(error)
    }
}

// Fonction / promesse permettant la suppression d'une image.
function deleteImage(imageURL) {
    return new Promise((resolve, reject) => {
        const fileName = imageURL.replace(/^http:\/\/localhost:4000\/images\//, '');
        const filePath = path.join(__dirname, '../images', fileName);
        
        fs.unlink(filePath, (error) => {
            if (error) {
                return reject("Une erreur s'est produite lors de la supression de l'image du livre.");
            }

            resolve("Livre du livre a été supprimée avec succès.")
        });
    })    
}



exports.createBook = (req, res, next) => {
    const bookData = req.body

    const newBook = new book({
        ...bookData,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })

    newBook.save()
        .then(() => res.status(201).json({ message: 'Nouveau livre enregistré.' }))
        .catch((error) => res.status(500).json({ error }));
}

exports.loadBooks = (req, res, next) => {
    book.find()
        .then((books) => {
            if (!books) {
                return res.status(404).json({ message: 'Livres non trouvés.' })
            }
            res.status(200).json(books)
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.loadBook = (req, res, next) => {
    const bookId = req.params.id    

    book.findById(bookId)
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' })
            }            
            res.status(200).json(book)
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.getBestRating = (req, res, next) => {
    book.find().sort({ averageRating: -1 }).limit(3)
        .then((books) => {
            if (!books) {
                return res.status(404).json({ message: "Aucun livre n'a été trouvé." })
            }

            res.status(200).json(books)
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.updateBook = (req, res, next) => {
    const bookId = req.params.id;
    const updatedData = req.body;
    const requestingUserId = req.user.userId;

    book.findById(bookId)
        .then((findBook) => {
            if (!findBook) {
                return res.status(404).json({ message: "Livre non trouvé." });
            }

            if (requestingUserId !== findBook.userId) {
                return res.status(401).json({ message: 'Non autorisé!' });
            }

            if (req.file) {
                usePromise(deleteImage(findBook.imageUrl))
                updatedData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            }

            Object.assign(findBook, updatedData);

            return findBook.save()
                .then(() => res.status(200).json({ message: "Livre mis à jour avec success.", book: findBook }))
                .catch((error) => res.status(500).json({ error: error }));
        })
        .catch((error) => res.status(500).json({ error: error }));
}

exports.rateBook = (req, res, next) => {
    const bookId = req.params.id;
    const rate = req.body;

    if (rate.rating < 0 || rate.rating > 5) {
        return res.status(400).json({ message: "Valeur de notation incorrect." })
    }

    book.findById(bookId)
        .then((findBook) => {
            if (!findBook) {
                return res.status(404).json({ message: "Aucun livre trouvé avec cet identifiant." });
            }
            
            findBook.ratings.forEach((element) => {
                if (rate.userId === element.userId) {
                    return res.status(400).json({ message: "L'utilisateur a déjà mis une note sur ce livre." })
                }
            });

            findBook.ratings.push(rate)

            let newAverageRatingRaw = 0
            findBook.ratings.forEach((element) => {
                newAverageRatingRaw += element.grade || element.rating;
            });
            newAverageRatingRaw = newAverageRatingRaw / findBook.ratings.length;
            newAverageRating = Math.round(newAverageRatingRaw) * 10 / 10

            findBook.averageRating = newAverageRating;

            findBook.save()
                .then((savedBook) => res.status(200).json(savedBook))
                .catch((error) => res.status(500).json({ error }))
        })
        .catch((error) => res.status(500).json({ error })) 
}

exports.deleteBook = (req, res, next) => {
    const bookId = req.params.id;
    const requestingUserId = req.user.userId

    book.findById(bookId)
        .then((findBook) => {
            if (!findBook) {
                return res.status(404).json({ message: "Livre non trouvé." });
            }

            if (requestingUserId !== findBook.userId) {
                return res.status().json({ message: 'Non autorisé!' });
            }

            const imageUrl = findBook.imageUrl;

            findBook.deleteOne()
                .then(() => {
                    usePromise(deleteImage(imageUrl))
                    res.status(200).json({ message: "Livre supprimé avec succès." });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
}