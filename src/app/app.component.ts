import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgZone } from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { AnimationPlayer } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userControl = new FormControl();
  private chart: am4charts.XYChart;
  users = [];
  selectedUsers = new Array<any>();
  favouriteUsers = new Array<any>();
  filteredUsers: any;
  lastFilter: string = '';
  filteredMovies: any;

  isLoading = false;
  errorMsg: string;
  daydata: any = [];
  constructor(
    private http: HttpClient, private zone: NgZone
  ) { }

  ngOnInit() {

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE,',
      })
    };
    this.isLoading = true
    this.http.get("https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/all.json", httpOptions)
      .pipe(
        finalize(() => {
          this.isLoading = false
        }),
      )
      .subscribe(data => {
        this.errorMsg = "";
        this.filteredUsers = this.filteredMovies = data;
      });

    this.userControl.valueChanges.subscribe(val => {
      if (val) {
        this.filteredUsers = this.filteredMovies.filter(option => {
          return option.name.toLowerCase().indexOf(val.toLowerCase()) >= 0;
        })
      } else {
        this.filteredUsers = this.filteredMovies;
      }
    })
  }


  displayFn(value): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          displayValue = user.name;
        } else {
          displayValue += ', ' + user.name;
        }
      });
    } else {
      displayValue = value;
    }
    return displayValue;
  }

  optionClicked(event: Event, user) {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  toggleSelection(user) {
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedUsers.push(user);
    } else {
      const i = this.selectedUsers.findIndex(value => value.name === user.name);
      this.selectedUsers.splice(i, 1);
    }

    this.userControl.setValue(null);
  }

  favourite(user) {
    const i = this.favouriteUsers.findIndex(value => value.id === user.id);
    if (i > -1) {
      alert("Already added");
      return false;
    }
    this.favouriteUsers.push(user);
  }

  reset() {
    this.filteredUsers = this.filteredUsers.map((data) => {
      data.selected = false;
      return data;
    })
    console.log(this.filteredUsers);
    this.selectedUsers = [];
  }

  compare() {
    if (this.selectedUsers.length < 2) {
      alert("Please select at least 2 hero");
      return;
    }
    let chart = am4core.create("chartdiv", am4charts.RadarChart);
    let data = [];
    let value1 = '';
    let value2 = '';
    let value3 = '';
    let value4 = '';

    for (let i = 0; i < Object.keys(this.selectedUsers[0].powerstats).length; i++) {
      let category = Object.keys(this.selectedUsers[0].powerstats)[i];
      value1 = this.selectedUsers[0].powerstats[category];
      value2 = this.selectedUsers[1].powerstats[category];
      value3 = (this.selectedUsers[2]) ? this.selectedUsers[2].powerstats[category] : '';
      value4 = (this.selectedUsers[3]) ? this.selectedUsers[3].powerstats[category] : '';
      data.push({ category: category, value1: value1, value2: value2, value3: value3, value4: value4 })
    }
    chart.data = data;

    /* Create axes */
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.extraMin = 0.2;
    valueAxis.extraMax = 0.2;
    valueAxis.tooltip.disabled = true;
    let series = [];
    for (let j = 1; j <= this.selectedUsers.length; j++) {
      series[j] = chart.series.push(new am4charts.RadarSeries());
      series[j].dataFields.valueY = "value" + j;
      series[j].dataFields.categoryX = "category";
      series[j].strokeWidth = 3;
      series[j].tooltipText = "{valueY}";
      series[j].name = this.selectedUsers[j - 1].name;
      series[j].bullets.create(am4charts.CircleBullet);
    }

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarY = new am4core.Scrollbar();

    chart.cursor = new am4charts.RadarCursor();

    chart.legend = new am4charts.Legend();
  }


  // ngAfterViewInit() {
  //   let chart = am4core.create("chartdiv", am4charts.RadarChart);

  //   let data = [];
  //   let value1 = 500;
  //   let value2 = 600;

  //   for (var i = 0; i < 12; i++) {
  //     let date = new Date();
  //     date.setMonth(i, 1);
  //     value1 -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 50);
  //     value2 -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 50);
  //     data.push({ date: date, value1: value1, value2: value2 })
  //   }
  //   console.log(data);
  //   chart.data = data;

  //   /* Create axes */
  //   let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());

  //   let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  //   valueAxis.extraMin = 0.2;
  //   valueAxis.extraMax = 0.2;
  //   valueAxis.tooltip.disabled = true;

  //   /* Create and configure series */
  //   let series1 = chart.series.push(new am4charts.RadarSeries());
  //   series1.dataFields.valueY = "value1";
  //   series1.dataFields.dateX = "date";
  //   series1.strokeWidth = 3;
  //   series1.tooltipText = "{valueY}";
  //   series1.name = "Series 2";
  //   series1.bullets.create(am4charts.CircleBullet);
  //   series1.dataItems.template.locations.dateX = 0.5;

  //   let series2 = chart.series.push(new am4charts.RadarSeries());
  //   series2.dataFields.valueY = "value2";
  //   series2.dataFields.dateX = "date";
  //   series2.strokeWidth = 3;
  //   series2.tooltipText = "{valueY}";
  //   series2.name = "Series 2";
  //   series2.bullets.create(am4charts.CircleBullet);
  //   series2.dataItems.template.locations.dateX = 0.5;

  //   chart.scrollbarX = new am4core.Scrollbar();
  //   chart.scrollbarY = new am4core.Scrollbar();

  //   chart.cursor = new am4charts.RadarCursor();

  //   chart.legend = new am4charts.Legend();

  // }

}
