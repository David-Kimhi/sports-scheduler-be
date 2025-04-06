const express = require('express');
const { searchTeamByName, getTeamNextEvents } = require('./services/sportsdb');

const app = express();
const port = 3000;

app.get('/schedule/:team', async (req, res) => {
  try {

    const { type = 'next', location } = req.query; // default type = 'next'

    const team = await searchTeamByName(req.params.team);
    if (!team) return res.status(404).send('Team not found');

    let events;
    if (type === 'next') {
      events = await getTeamNextEvents(team.idTeam);
    } else if (type === 'past') {
      events = await getTeamPastEvents(team.idTeam);
    } else {
      return res.status(400).send('Invalid type parameter (use "next" or "past")');
    }

    // Filter by location if requested
    if (location === 'away') {
      events = events.filter(e => e.strAwayTeam === team.strTeam);
    } else if (location === 'home') {
      events = events.filter(e => e.strHomeTeam === team.strTeam);
    }

    res.json({ team: team.strTeam, events });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
