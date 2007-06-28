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

var currently_playing = null;

function play(id, href) {
	stop ();
	
	soundManager.createSound ({
		id: id,
		url: href,
		onfinish: function() {
			next();
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
	$("td.playing", row).empty().append("<img alt=\"\" width=\"16\" height=\"16\" src=\"images/nowplaying.png\">");

	soundManager.play (currently_playing);
}

function stop() {
	if (currently_playing != null) {
		soundManager.destroySound (currently_playing);
		$("tr#" + currently_playing + " td.playing").empty();
		$("#now_playing").empty();
		currently_playing = null;
	}
}

function pause() {
	if (currently_playing == null)
		return;
		
	soundManager.togglePause (currently_playing);
	
	var state;
	if (soundManager.sounds[currently_playing].paused)
		state = "paused";
	else
		state = "playing";
		
	$("tr#" + currently_playing + " td.playing").empty ().append(state);
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
	
	if (pos <= 3000)
		$("tr#" + current_id).prev().click();
	else
		$("tr#" + current_id).click();
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

$(document).ready(function() {
	$("h1#title").fadeIn("slow"); // unnecessary bling :)
	$("#flash_player").hide();	
	$("#table_container").hide();
	loadArtists();
})

soundManager.debugMode = false;
