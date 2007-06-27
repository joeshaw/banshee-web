function populateSelect (select, array) {
	select.empty();
	select.unbind("change");
	
	for (var i = 0; i < array.length; i++) {
		var entry = '<option value="' + array[i] + '">' + array[i] + '</option>';
		select.append(entry);
	}
	
	// For some reason, adding items interactively causes them to
	// display as though they were selected.  Reset them with this.
	select[0].selectedIndex = -1;
	
	return i;
}

function populateTable (table, array) {
	tbody = $("tbody", table);
	tbody.empty();

	function generateTableItem (array, i, field) {
		return '<td><a href="#" onclick="loadFile(\''+ array[i]["href"] + '\')">' 
			+ array[i][field] + '</a></td>';
	}

	for (var i = 0; i < array.length; i++) {
		var entry = '<tr id="' + array[i]["id"] + '">'
			+ generateTableItem (array, i, "number")
			+ generateTableItem (array, i, "name")
			+ generateTableItem (array, i, "length")
			+ generateTableItem (array, i, "artist")
			+ generateTableItem (array, i, "album")
			+ "</tr>";

		tbody.append(entry);
	}
}

function loadFile(href) {
	if (s == null) {
		s = new SWFObject("mp3player.swf", "line", "100%", "20", "7");
		s.addVariable("showdownload", "true");
	}
		
	s.addVariable("file", href);
	s.addVariable("autostart", "true");
	s.write("flash_player");
	$("#flash_player").show();
}

function loadArtists () {
	$.getJSON("artists.json", function(json) {
		var artist_list = $("#artist_list");
		
		count = populateSelect(artist_list, json);
		
		artist_list.change(function() {
			loadAlbums();
		});
	});
}

function loadAlbums () {
	artists = getSelected($("#artist_list"));
	
	$.getJSON("albums.json", {"artists" : artists}, function(json) {
		populateSelect($("#album_list"), json);
		
		$("#album_list").change(function() {
			loadTracks();
		})				
	});
}

function loadTracks () {
	albums = getSelected($("#album_list"));
	
	$.getJSON("tracks.json", {"albums" : albums}, function(json) {
		populateTable($("#track_table"), json);
	});
}

function getSelected (select) {
	list = [];
	select.children("option[@selected]").each(function() {
		list.push($(this).val());
	});
	return list;
}

function printSelected () {
	var artists = getSelected($("#artist_list"));
	var albums = getSelected($("#album_list"));
	alert("Artists: " + artists + "\n" + "Albums: " + albums);
}

var s;

$(document).ready(function() {
	$("#flash_player").hide();	
	loadArtists();
})
