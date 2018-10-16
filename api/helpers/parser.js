module.exports = {
    getStationsDOC: async (meals, currentMealTime) =>
    {
        for(const meal of meals){
            if(meal.name === currentMealTime){
                const stations = [];
                for(const station of meal.categories){
                    stations.push({Id: station.id, Name: station.name, Items: station.items.length});
                }
                return stations;
            }
        }
    },
    getStationMenuDOC: async (meals, currentMealTime, stationName) =>
    {
        for(const meal of meals){
            if(meal.name === currentMealTime){
                for(const station of meal.categories){
                    if(station.name === stationName){
                        let menuItems = [];
                        for(const item of station.items){
                            let labels = [];
                            let allergens = [];
                            for(const filter of item.filters)
                            {
                                if(filter.type === 'label')
                                    labels.push(filter.name);
                                else if(filter.type === 'allergen')
                                    allergens.push(filter.name);
                            }
                            menuItems.push({Name: item.name, Portion: item.portion, Calories: item.calories, Allergens: allergens, Labels: labels });
                        }
                        return menuItems;
                    }
                }
            }
        }
    }
}