// Functions for populating <select> and <table> tags

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
		return '<td id="' + field + array[i]["id"] + '">'+ array[i][field] + '</td>';
	}

	for (var i = 0; i < array.length; i++) {
		var entry = '<tr id="' + array[i]["id"]
			+ '" onclick="play(\'' + array[i]["id"] + '\', \'' + array[i]["href"] + '\')">'
			+ '<td class="playing"></td>'
			+ generateTableItem (array, i, "number")
			+ generateTableItem (array, i, "name")
			+ generateTableItem (array, i, "length")
			+ generateTableItem (array, i, "artist")
			+ generateTableItem (array, i, "album")
			+ "</tr>";
		tbody.append(entry);
	}
}

///////////////////////////////////////
// Functions to get the currently selected options in a <select> list

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

///////////////////////////////////////

function formatTime(ms) {
	var hours, minutes, seconds;
	
	hours = parseInt(ms / (1000*60*60));
	ms = ms % (1000*60*60);
	
	minutes = parseInt(ms / (1000*60));
	ms = ms % (1000*60);
	
	seconds = parseInt(ms / 1000);
	
	output = "";
	if (hours > 0)
		output += hours + ":";
		
	output += minutes + ":";
	
	if (seconds < 10)
		output += "0";
		
	output += seconds;

	return output;
}

///////////////////////////////////////
// Audio playback functions

var currently_playing = null;

function play(id, href) {
	stop ();
	
	soundManager.createSound ({
		id: id,
		url: href,
		onfinish: function() {
			next();
		},
		whileplaying: function() {
			$("#current_time").empty().append(formatTime(this.position) + " of " + formatTime(this.durationEstimate));
		}
	});
	currently_playing = id;
	
	var row = $("tr#" + id);
	var output = "Now playing: "
		+ $("td#name" + id, row).html()
		+ " ("
		+ $("td#artist" + id, row).html()
		+ " - "
		+ $("td#album" + id, row).html()
		+ ")";
		
	$("#now_playing").empty().append(output);
	$("#now_playing").fadeIn();
	$(row).addClass("nowplaying");

	soundManager.play (currently_playing);
}

function stop() {
	if (currently_playing != null) {
		soundManager.destroySound (currently_playing);
		$("tr#" + currently_playing).removeClass("nowplaying").removeClass("paused");;
		$("#now_playing").empty();
		$("#current_time").empty();
		currently_playing = null;
	}
}

function pause() {
	if (currently_playing == null)
		return;
		
	soundManager.togglePause (currently_playing);
	
	if (soundManager.sounds[currently_playing].paused)
		$("tr#" + currently_playing).removeClass("nowplaying").addClass("paused");
	else
		$("tr#" + currently_playing).removeClass("paused").addClass("nowplaying");
}

function next() {
	var current_id = currently_playing;
	stop();
	$("tr#" + current_id).next().click();
}

function prev() {
	var current_id = currently_playing;
	var pos = soundManager.sounds[currently_playing].position;
	
	stop();
	
	// 2 seconds is the threshold at which we repeat the current song rather
	// than going to the previous track.
	if (pos <= 2000)
		$("tr#" + current_id).prev().click();
	else
		$("tr#" + current_id).click();
}

///////////////////////////////////////
// Functions which load artist/album/track data via AJAJ

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
		$("#track_table").tableSorter({
			sortColumn: "Artist",
			sortClassAsc: "headerSortUp",
			sortClassDesc: "headerSortDown",
			headerClass: "header",
			stripingRowClass: ["evenrow", "oddrow"],
			stripeRowsOnStartup: "true"
		});
		$("#table_container").fadeIn("slow");
	});
}

///////////////////////////////////////

$(document).ready(function() {
	$("h1#title").fadeIn("slow"); // unnecessary bling :)
	$("#flash_player").hide();	
	$("#table_container").hide();
	loadArtists();
})

soundManager.debugMode = false;
