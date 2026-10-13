import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search as SearchIcon, Dumbbell, Apple, SearchX } from 'lucide-react';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const workouts = useSelector(state => state.workout.workouts);
  const meals = useSelector(state => state.nutrition.meals);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { workouts: [], meals: [] };

    const lowerQuery = query.toLowerCase();

    // Check all values in the object to see if any contain the query string
    const matchObject = (obj) => {
      return Object.values(obj).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery)
      );
    };

    const matchedWorkouts = workouts.filter(matchObject);
    const matchedMeals = meals.filter(matchObject);

    return { workouts: matchedWorkouts, meals: matchedMeals };
  }, [query, workouts, meals]);

  const hasResults = searchResults.workouts.length > 0 || searchResults.meals.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="search-container">
      <header className="search-header">
        <h1>Global Search</h1>
        <p>Find past workouts, meals, calories, and notes.</p>
        
        <div className="search-input-wrapper">
          <Input 
            type="text" 
            placeholder="Search for 'Bench Press', '300', 'Chicken'..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<SearchIcon size={20} />}
          />
        </div>
      </header>

      {isSearching && (
        <div className="search-results">
          {!hasResults ? (
            <div className="empty-state">
              <SearchX size={48} className="empty-icon" />
              <h3>No results found</h3>
              <p>We couldn't find anything matching "{query}"</p>
            </div>
          ) : (
            <div className="results-grid">
              
              {searchResults.workouts.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">
                    <Dumbbell size={20} color="var(--accent-primary)" />
                    Workouts
                  </h2>
                  <div className="cards-grid">
                    {searchResults.workouts.map(workout => (
                      <Card key={workout.id} className="result-card">
                        <div className="result-header">
                          <h3>{workout.exerciseName}</h3>
                          <span className="result-date">{workout.date}</span>
                        </div>
                        <div className="result-stats">
                          <span>{workout.duration} min</span>
                          <span className="highlight">{workout.caloriesBurned} kcal</span>
                        </div>
                        {workout.notes && <p className="result-notes">"{workout.notes}"</p>}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.meals.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">
                    <Apple size={20} color="var(--accent-success)" />
                    Nutrition
                  </h2>
                  <div className="cards-grid">
                    {searchResults.meals.map(meal => (
                      <Card key={meal.id} className="result-card">
                        <div className="result-header">
                          <h3>{meal.mealName}</h3>
                          <span className="result-date">{meal.date}</span>
                        </div>
                        <div className="result-stats">
                          <span className="highlight">{meal.calories} kcal</span>
                          <span>P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g</span>
                        </div>
                        {meal.notes && <p className="result-notes">"{meal.notes}"</p>}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
