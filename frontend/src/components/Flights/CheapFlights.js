

import React, { Component } from 'react'
import axios from 'axios'
import airports from '../../data/airports';

import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment'



Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}



var date = new Date();

let d = date.addDays(7)
console.log(date, d)



export default class HotelSearch extends Component {


  state = {
    selectedFlight: null,
    searchQuery: "",
    searchTo: "",
    flights: [],
    filteredFlights: [],
    userLocation: { lat: 32, lng: 32 },
    loading: true,
    cityFrom: [],
    startDate: moment(),
    endDate: moment().add(3, 'days'),

  };

  componentDidMount() {



    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        this.setState({
          userLocation: { lat: latitude, lng: longitude },
          loading: false
        });
      },
      () => {
        this.setState({ loading: false });
      }
    );
  }


  getFlights = () => {


    // IATA to City Name
    let cityFrom = this.state.searchQuery
    let cityTo = this.state.searchTo
    let endDate = this.state.endDate.format('YYYY-MM-DD')
    let startDate = this.state.startDate.format('YYYY-MM-DD')
    console.log(endDate, startDate)


    let airportFrom = airports.find(airport => {
      return (airport.city == cityFrom || airport.city.toLowerCase() == cityFrom || airport.iata_code == cityFrom) // airport.state == cityFrom ||
    })
    let airportTo = airports.find(airport => {
      return (airport.city == cityTo || airport.city.toLowerCase() == cityTo || airport.iata_code == cityTo) // airport.state == cityFrom ||
    })

    let from = airportFrom ? airportFrom.iata_code : cityFrom
    let to = airportTo ? airportTo.iata_code : cityTo
    // IATA to City Name




    //get token on mount
    console.log("getFlight!");
    fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      body:
        "grant_type=client_credentials&client_id=AAAIgJEuGHf4LReD2lxXUiGEcrHHL5Q6&client_secret=PyEChDme4fGCMvzZ",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    })
      .then(res => res.json())
      .then(r => {
        console.log(r);
        let token = r.access_token; //token comes here
        const RAPIDAPI_API_URL = `https://test.api.amadeus.com/v1/shopping/flight-offers?origin=${from}&destination=${to}&departureDate=${startDate}&returnDate=${endDate}&adults=1&nonStop=false&max=50`; // if you fetch in componentDidMount it returns error because there is no origin when the page is loaded
        
        console.log(this.state, RAPIDAPI_API_URL, "[][][[]");
        const RAPIDAPI_REQUEST_HEADERS = {
          Authorization: `Bearer ${token}` //token goes here
        };

        axios
          .get(RAPIDAPI_API_URL, {
            headers: RAPIDAPI_REQUEST_HEADERS
          }) //use token to get data
          .then(response => {
            const data = response.data.data;
            console.log("data", response, data.data);

            // let firstCity = data.data.find(eachPlace => {
            //   return eachPlace.CityId.includes(this.state.cityFrom) || eachPlace.CityName.includes(this.state.cityFrom);
            // })
            // console.log('cityyyy', firstCity)
            // let secondCity = data.Places.find(eachPlace => {
            //   return eachPlace.CityId.includes(cityFrom) || eachPlace.CityName.includes(cityFrom);;
            // })


            this.setState({

              // cityFrom: firstCity.CityName,
              // cityTo: secondCity.CityName,  
              flights: data, //set the flights to state
              filteredFlights: data
            });
          })
          .catch(error => {
            console.error("create student error", error.response);
          });
      });
  };

  handleInputChange = e => { // cityFrom
    console.log(this.state);
    this.setState({
      searchQuery: e.target.value
    });
  };

  handleInputTo = e => {
    console.log(this.state);
    this.setState({
      searchTo: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.getFlights(); //after the user told you what to
  };

  findName = (code) => {
    let airport = airports.find(air => air.iata_code == code)
    return airport.city;
  }

  setDate = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate })
  }

  showSegments = (segments) => {
    return segments.map((segment, i) => {
      return (
        <ul> <div className="leg">{i + 1} leg </div>
          <li>{this.findName(segment.flightSegment.departure.iataCode)}</li>
          <li>{this.findName(segment.flightSegment.arrival.iataCode)}</li>
        </ul>
      )
    })
  }
  showFlights = () => {
    return this.state.filteredFlights.map((flight, index) => {
      let airportFrom = airports.find(airport => {
        if (airport.iata_code == flight.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode) {
          console.log(airport.city)
        }
      })
      console.log(airportFrom)
      console.log(flight);
      console.log(flight.offerItems[0].services[0].segments[0].flightSegment);

      return (
        <ul key={index}>
          <h4>Inbound</h4>
          {this.showSegments(flight.offerItems[0].services[0].segments)}
          <li>From {flight.offerItems[0].services[0].segments[0].flightSegment.departure.iataCode}</li>
          <li>To {flight.offerItems[0].services[0].segments[0].flightSegment.arrival.iataCode}</li>
          <li>Carrier {flight.offerItems[0].services[0].segments[0].flightSegment.operating.carrierCode}</li>
          <li>Duration {flight.offerItems[0].services[0].segments[0].flightSegment.duration}</li>
          <li>Price {flight.offerItems[0].price.total}  </li>
        </ul>
      );

      {/* <h4>OutBound</h4>
              <li>From {flight.offerItems[0].services[0].segments[1].flightSegment.departure.iataCode}</li> */}
      {/* <li>To {flight.offerItems[0].services[0].segments[1].flightSegment.arrival.iataCode}</li>
              <li>Carrier {flight.offerItems[0].services[0].segments[1].flightSegment.operating.carrierCode}</li>
              <li>Duration {flight.offerItems[0].services[0].segments[1].flightSegment.duration}</li> */}




    });
  };




  render() {
    return (
      <div>
        {/* <Fragment> */}
        <div>
          <form onSubmit={this.handleSubmit}>
            <input
              placeholder="Input your location"
              value={this.state.query}
              onChange={this.handleInputChange}
            />
            <input
              placeholder="Input your location"
              value={this.state.query}
              onChange={this.handleInputTo}
            />
            <DateRangePicker className='dateForm'
              startDate={this.state.startDate} // momentPropTypes.momentObj or null,
              startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
              endDate={this.state.endDate} // momentPropTypes.momentObj or null,
              endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
              onDatesChange={({ startDate, endDate }) => this.setDate({ startDate, endDate })}//this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
            />




            <input type="submit" value="Search cheap flights" />
            


          </form>
        </div>
        <div>{this.showFlights()}</div>
        {/* </Fragment> */}


        {/* <div>
                  <h1>{this.state.selectedPlace.name}</h1>
                </div> */}


      </div>
    )
  }
}