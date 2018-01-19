# An Analysis of Vacant Buildings in Baltimore City

## Link
[https://mimikim.github.io/Analysis-of-Vacant-Buildings-in-Baltimore-City/](https://mimikim.github.io/Analysis-of-Vacant-Buildings-in-Baltimore-City/)

## Description
This is an informational visualization of data regarding vacancies in Baltimore city. This page has been generated using ChartJS, PleaseJS, JavaScript, HTML, SCSS, and the Socrata Open Data API (SODA). The accuracy of the data presented below relies upon the accuracy of the data set provided by [OpenBaltimore](https://data.baltimorecity.gov/Housing-Development/Vacant-Buildings/qqcv-ihn5), which aggregates data from the [Housing Authority of Baltimore City](http://www.baltimorehousing.org/). Whenever this particular data set is updated, these graphs will update accordingly.

### Notes
As of March 14, 2017, there is a typo in the dataset's Police Districts column. An additional value of "Notheastern" is saved in this column, which ends up skewing the data so that it looks like the actual NorthEastern police district has little-to-no vacants. I have added a fix in my JavaScript to correctly combine and output the data for the Northeastern district.

### Dependencies
- [Socrata Open Data API](https://dev.socrata.com/)
- [Vacant Buildings Dataset](https://dev.socrata.com/foundry/data.baltimorecity.gov/rw5h-nvv4)
- [ChartJS](chartjs.org)
- [PleaseJS](http://www.checkman.io/please)