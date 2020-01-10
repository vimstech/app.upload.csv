window.addEventListener('load', () => {
  // Get Upload input
  const uploadInput = document.getElementById('uploadCSV');
  // Data and pagination for both columns and rows
  var csv = {
    headers: [],
    renderedHeaders: [],
    records: [],
    currentPage: 1,
    perPage: 5,
    totalRecords: 0,
    pages: 0,
    data: null,
    columns: {
      totalColumns: 0,
      showing: 5,
      startIndex: 0,
    }
  };

  /**
   * Add Listener to upload input to listen to change in file input
   * also create object of File reader and add listener to read file.
   * when file is choosen read file and trigger event to parse csv.
   * [Clear input fied so that change occur again to upload new file]
  */
  uploadInput.addEventListener('change', (event) => {
    var files = event.currentTarget.files;
    if (files && files.length > 0) {
      var reader = new FileReader();
      reader.onload = (e) => {
        var result = e.target.result;
        csv.data = result;
        document.dispatchEvent(new Event('parseCSV'));
      }
      reader.readAsText(files[0]);
      event.currentTarget.value = '';
    }
  });

  /**
   * add listener for event parseCSV,
   *  1. Split data by new line
   *  2. again split each row by seperator (,) by keeping empty string value.
   *  3. seperate header and records and store then in csv hash.
   *  4. trigger event to parse array to objects.
   */
  document.addEventListener('parseCSV', () => {
    rows = csv.data.match(/[^\r\n]+/g);
    rows = rows.map(a => a.match(/(("[^"]*")|[^,]+)|(?=,(,|$))/g));
    csv.headers = rows[0];
    csv.columns.totalColumns = csv.headers.length;
    csv.records = rows.slice(1);
    document.dispatchEvent(new Event('toObject'));
  });

  /**
   * create array of objects from array of array
   * and save those objects to csv hash.
   */
  document.addEventListener('toObject', () => {
    rows = csv.records.map(row => {
      let obj = {};
      csv.headers.forEach((key, index) => {
        obj[key] = row[index] || '-';
      });
      return obj;
    });
    csv.records = rows;
    csv.totalRecords = csv.records.length;
    document.dispatchEvent(new Event('loadData'));
  });

  /** Calculate total pages and set current page */
  document.addEventListener('loadData', () => {
    csv.pages = (csv.records.length / csv.perPage).toFixed(0);
    csv.currentPage = 1;
    document.dispatchEvent(new Event('renderData'));
  });

  /** Render update table with header and body */
  document.addEventListener('renderData', () => {
    document.dispatchEvent(new Event('renderHeader'));
    document.dispatchEvent(new Event('renderBody'));
  });

  /**
   * Render header for with specified index and number of headers
   * set rendered headers to csv so that we can use this to render body again.
  */
  document.addEventListener('renderHeader', () => {
    let columns = csv.columns;
    let startIndex = columns.startIndex;
    let endIndex = columns.startIndex + columns.showing;
    let headers = csv.headers.slice(startIndex, endIndex);
    csv.renderedHeaders = headers;
    let arr = [];
    headers.forEach((h) => {
      arr.push('<li class="column">', h, '</li>');
    });
    document.getElementById('tableHeader').innerHTML = arr.join('');
  });

  /**
   * Render body for specified page and number of records per pages,
   * user rendered headers to render specified columns for each row.
   */
  document.addEventListener('renderBody', () => {
    document.getElementById('pageCount').innerText = csv.currentPage;
    let startIndex = (csv.perPage) * (csv.currentPage - 1);
    let endIndex = startIndex + csv.perPage;
    let records = csv.records.slice(startIndex, endIndex);

    let body = [];
    records.forEach((record, index) => {
      body.push('<li class="row" data-index="',index,'">');
      csv.renderedHeaders.forEach((key) => {
        let v = record[key];
        body.push('<div class="column">', v || '-', '</div>');
      });
      body.push('</li>');
    });
    document.getElementById('tableBody').innerHTML = body.join('');
  });

  /** Get Previous page of the records. */
  document.getElementById('previousPage').addEventListener('click', () => {
    if (csv.currentPage > 1) {
      csv.currentPage = csv.currentPage - 1;
      document.dispatchEvent(new Event('renderBody'));
    }
  });

  /** Get next page of records. */
  document.getElementById('nextPage').addEventListener('click', () => {
    if (csv.currentPage < csv.pages) {
      csv.currentPage = csv.currentPage + 1;
      document.dispatchEvent(new Event('renderBody'));
    }
  });

  /** Get next Headers */
  document.getElementById('nextHeaders').addEventListener('click', () => {
    if((csv.columns.startIndex + csv.columns.showing) < csv.columns.totalColumns){
      csv.columns.startIndex = csv.columns.startIndex + 1;
      document.dispatchEvent(new Event('renderData'));
    }
  });

  /** Get previous headers */
  document.getElementById('prevHeaders').addEventListener('click', () => {
    if(csv.columns.startIndex > 0){
      csv.columns.startIndex = csv.columns.startIndex - 1;
      document.dispatchEvent(new Event('renderData'));
    }
  });
});
