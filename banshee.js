		load_music = function() {
			$.get("data.html", function(data) {
				$(".musiclist").append(data);
				$(".musiclist > tbody > tr > td").mouseover(function() {
					// change color
				});
				$(".musiclist > tbody > tr > td").click(function() {
					// ajax download additional song info
					alert("You clicked " + $("this"));
				});
			})
		}

		populate_select = function(select, array) {
			select.empty();
			select.unbind("change");
			
			for (var i = 0; i < array.length; i++) {
				var entry = '<option value="' + array[i] + '">' + array[i] + '</option>';
				select.append(entry);
			}
			
			// For some reason, adding items interactively causes them to
			// display as though they were selected.  Reset them with this.
			select[0].selectedIndex = -1;
		}

		load_artists = function() {
			$.getJSON("artists.json", function(json) {
				var artist_list = $("#artist_list");

				populate_select(artist_list, json);
				
				artist_list.change(function() {
					load_albums();
				});

				// Show up to 20 items
				artist_list.attr("size", i >= 20 ? 20 : i);
			})
		}
		
		load_albums = function() {
			artists = get_selected($("#artist_list"));
			
			$.getJSON("albums.json", {"artists" : artists}, function(json) {
				populate_select($("#album_list"), json);
				
				$("#album_list").change(function() {
					load_tracks();
				})				
			});
		}
		
		load_tracks = function() {
			albums = get_selected($("#album_list"));
			
			$.getJSON("tracks.json", {"albums" : albums}, function(json) {
				populate_table($("#track_table"), json);
			});
		}
				
		populate_table = function(table, array) {
			tbody = $("tbody", table);
			tbody.empty();

			for (var i = 0; i < array.length; i++) {
				var entry = '<tr id="' + array[i]["id"] + '"><td>' + array[i]["number"] + '</td><td>' + array[i]["name"] + '</td><td>' + array[i]["length"] + '</td><td>' + array[i]["artist"] + '</td><td>'+ array[i]["album"] + '</td></tr>';

				tbody.append(entry);
			}
		}
		
		get_selected = function(select) {
			list = [];
			select.children("option[@selected]").each(function() {
				list.push($(this).val());
			});
			return list;
		}
		
		print_selected = function() {
			var artists = get_selected($("#artist_list"));
			var albums = get_selected($("#album_list"));
			alert("Artists: " + artists + "\n" + "Albums: " + albums);
		}
	
		$(document).ready(function() {
			load_artists();
		})

