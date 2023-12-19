var express = require('express');
var app = express();
/* Implement the logic here */

// connect to MongoDB
var db = require('mongoose');
db.set('strictQuery', false); //to avoid the warning message 
db.connect('mongodb://mongodb/bigcities', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('MongoDB connected…')
    })
    .catch(err => {
        console.log("MongoDB connection error: "+err); 
    });
// if the db connection is lost
db.connection.on('disconnected', () => {
    console.log('MongoDB disconnected...');
    process.exit(1); // Terminate the program with a non-zero exit code
});
var schema = new db.Schema({
    _id: Number,
    Name: String,
    'ASCII Name': String,
    'ISO Alpha-2': String,
    'ISO Name EN': String,
    Population: Number,
    Timezone: String,
    'Modification date': String,
    Coordinates: String
});
//Create model
var bigcities = db.model("citie", schema, "cities");

// Task B
app.get('/cities/v1/all', async (req, res) => {
    const { gte, lte } = req.query;
    if (Object.keys(req.query).length === 0) { // situation 1
        try {
            const cities = await bigcities.find().sort({_id: 1});
            const transformedCities = cities.map(city => {
                const [lat, lng] = city.Coordinates.split(',');
                return {
                    ...city._doc,
                    Coordinates: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    }
                };
            });
            console.log(transformedCities);
            res.status(200).json(transformedCities);
        } catch (error) { // situation 3
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    } else {  // situation 2
        try {
            let query = {};
            if (gte && lte) {
                query.Population = { $gte: parseInt(gte), $lte: parseInt(lte) };
            } else if (gte) {
                query.Population = { $gte: parseInt(gte) };
            } else if (lte) {
                query.Population = { $lte: parseInt(lte) };
            }
            const cities = await bigcities.find(query).sort({ Population: -1 });
            if (cities.length === 0) {
                return res.status(404).json({ error: 'No record for this population range' });
            }
    
            const transformedCities = cities.map(city => {
                const [lat, lng] = city.Coordinates.split(',');
                return {
                    ...city._doc,
                    Coordinates: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    }
                };
            });
            res.status(200).json(transformedCities);
        } catch (error) {  // situation 3
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
});
// Task C
app.get('/cities/v1/alpha/:code?', async (req, res) => {
    const alphaCode = req.params.code;

    try {
        if (alphaCode) { // situation 2
            const cities = await bigcities.find({ 'ISO Alpha-2': alphaCode })
                .sort({ Population: -1 });

            if (cities.length === 0) {
                return res.status(404).json({ error: 'No record for this alpha code' });
            }

            const transformedCities = cities.map(city => {
                const [lat, lng] = city.Coordinates.split(',');

                return {
                    "ASCII Name": city['ASCII Name'],
                    Population: city.Population,
                    Timezone: city.Timezone,
                    Coordinates: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    }
                };
            });

            res.status(200).json(transformedCities);
        } else { // situation 1
            const uniqueAlphaCodes = await bigcities.distinct('ISO Alpha-2');
            const alphaCodeObjects = await Promise.all(
                uniqueAlphaCodes.map(async (code) => {
                    const city = await bigcities.findOne({ 'ISO Alpha-2': code });
                    return {
                        code: code,
                        name: city['ISO Name EN']
                    };
                })
            );

            const sortedAlphaCodes = alphaCodeObjects.sort((a, b) =>
                a.code.localeCompare(b.code)
            );

            res.status(200).json(sortedAlphaCodes);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
// Task D
app.get('/cities/v1/region/:region?', async (req, res) => {
    const region = req.params.region;
    try {
        if (region) { // situation 2
            const cities = await bigcities.find({ 'Timezone': { $regex: `^${region}` } })
                .sort({ Population: -1 });

            if (cities.length === 0) {
                return res.status(404).json({ error: 'No record for this region' });
            }

            const transformedCities = cities.map(city => {
                const [lat, lng] = city.Coordinates.split(',');
                return {
                    'ASCII Name': city['ASCII Name'],
                    'ISO Alpha-2': city['ISO Alpha-2'],
                    'ISO Name EN': city['ISO Name EN'],
                    Population: city.Population,
                    Timezone: city.Timezone,
                    Coordinates: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    }
                };
            });

            res.status(200).json(transformedCities);
        } else { // situation 1
            const cities = await bigcities.find({}, { Timezone: 1 });
            const regionObjects = cities.map(city => {
                const region = city.Timezone.substring(0, city.Timezone.indexOf('/'));
                return region;
            });
            const sortedRegions = [...new Set(regionObjects)].sort((a, b) =>
                a.localeCompare(b)
            );
            res.status(200).json(sortedRegions);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
// Task E
app.get('/cities/v1/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const partial = req.query.partial === 'true';
        const alpha = req.query.alpha;
        const region = req.query.region;
        const sort = req.query.sort;

        let filter;
        if (alpha) {
            filter = partial ? { 'ISO Alpha-2': { $regex: alpha }, 'ASCII Name': { $regex: city } } : { 'ISO Alpha-2': alpha, 'ASCII Name': city};
        } else if (region) {
            filter = partial ? { 'Timezone': { $regex: `^${region}` }, 'ASCII Name': { $regex: city } } : { 'Timezone': region,  'ASCII Name': city };
        } else {
            filter = partial ? { 'ASCII Name': { $regex: city } } : { 'ASCII Name': city };
        }
        
        let sortFilter = {_id: 1};
        if (sort === 'alpha') {
            sortFilter = {'ISO Alpha-2': 1};
        } else if (sort === 'population') {
            sortFilter = {Population: -1};
        } else {
            sortFilter = {_id: 1};
        }
        const cities = await bigcities.find(filter).sort(sortFilter);

        if (cities.length === 0) {
            res.status(404).json({ error: 'No record for this city name' });
        } else {
            const formattedCities = cities.map(city => {
                const [lat, lng] = city.Coordinates.split(',');
                return {
                    _id: city._id,
                    'ASCII Name': city['ASCII Name'],
                    'ISO Alpha-2': city['ISO Alpha-2'],
                    'ISO Name EN': city['ISO Name EN'],
                    Population: city.Population,
                    Timezone: city.Timezone,
                    Coordinates: {
                        lat: parseFloat(lat),
                        lng: parseFloat(lng)
                    }
                };
            });

            res.status(200).json(formattedCities);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
// Task F
app.all('*', (req, res) => {
    const errorMessage = `Cannot ${req.method} ${req.originalUrl}`;
    res.status(400).json({ error: errorMessage });
});


// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'error': err.message});
});

app.listen(3000, () => {
  console.log('Weather app listening on port 3000!')
});