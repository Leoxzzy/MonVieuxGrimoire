const book = require('../models/book'); /* model de base de données concernant les livres */
const fs = require('fs'); /* gestion de fichiers */
const path = require('path'); /* gestion de chemins de fichiers */


exports.createBook = (req, res, next) => {
    const bookData = JSON.parse(req.body.book)

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

    book.findById(bookId)
        .then((findBook) => {
            if (!findBook) {
                return res.status(404).json({ message: "Livre non trouvé." });
            }

            if (req.file) {
                updatedData.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            }

            Object.assign(findBook, updatedData);

            return findBook.save()
                .then(() => res.status(200).json({ message: "Livre mis à jour avec success.", book: findBook }))
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
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

            let newAverageRating = 0
            findBook.ratings.forEach((element) => {
                newAverageRating += element.grade || element.rating;
            });
            newAverageRating = newAverageRating / findBook.ratings.length;

            findBook.averageRating = newAverageRating;

            console.log(bookId)

            findBook.save()
                .then((savedBook) => res.status(200).json(savedBook))
                .catch((error) => res.status(500).json({ error }))
        })
        .catch((error) => res.status(500).json({ error }))
 
}

exports.deleteBook = (req, res, next) => {
    const bookId = req.params.id;

    book.findById(bookId)
        .then((findBook) => {
            if (!findBook) {
                return res.status(404).json({ message: "Livre non trouvé." });
            }

            const imageUrl = findBook.imageUrl;
            const fileName = imageUrl.replace(/^http:\/\/localhost:4000\/images\//, '');
            const filePath = path.join(__dirname, '../images', fileName);

            findBook.deleteOne()
                .then(() => {

                    fs.unlink(filePath, (error) => {
                        if (error) {
                            return res.status(500).json({ error });
                        }
                        res.status(200).json({ message: "Livre supprimé avec succès." });
                    });

                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
}
