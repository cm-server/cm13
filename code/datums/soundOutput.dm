/datum/soundOutput
	var/client/owner 
	var/scape_cooldown				= INITIAL_SOUNDSCAPE_COOLDOWN //This value is changed when entering an area. Time it takes for a soundscape sound to be triggered
	var/list/soundscape_playlist 	= list() //Updated on changing areas
	var/ambience 					= null //The file currently being played as ambience
	var/status_flags 				= 0 //For things like ear deafness, psychodelic effects, and other things that change how all sounds behave

/datum/soundOutput/New(client/C)
	if(!C)
		qdel(src)
		return	
	owner = C
	. = ..()

/datum/soundOutput/proc/process_sound(datum/sound_template/T)
	var/sound/S = sound(T.file, T.wait, T.repeat)
	S.volume = owner.volume_preferences[T.volume_cat] * T.volume
	if(T.channel == 0)
		S.channel = get_free_channel()
	else
		S.channel = T.channel
	S.frequency = T.frequency
	if(T.x && T.y && T.z)		
		var/turf/owner_turf = get_turf(owner.mob)
		
		if(istype(owner.mob, /mob/living/carbon/hologram))
			var/mob/living/carbon/hologram/H = owner.mob
			if(H.linked_mob)
				owner_turf = null
				var/turf/linked_mob_turf = get_turf(H.linked_mob)

				S.x = T.x - linked_mob_turf.x
				S.y = 0
				S.z = T.y - linked_mob_turf.y
				S.falloff = T.falloff
		
		if(owner_turf)
			if(T.z != owner_turf.z && owner_turf.z == interior_manager.interior_z)	//if we are in interior and hear sound from outside
				S.falloff = T.falloff
				S.volume *= 0.5
			else
				S.x = T.x - owner_turf.x
				S.y = 0
				S.z = T.y - owner_turf.y
				S.falloff = T.falloff

	S.status = T.status
	if(owner.mob.ear_deaf > 0 || (owner.mob.mind && owner.mob.mind.original.ear_deaf > 0 && owner.mob.stat != DEAD) )
		S.status |= SOUND_MUTE

	sound_to(owner,S)

/datum/soundOutput/proc/update_ambience(area/new_area, force_cur_amb)
	if(!istype(new_area))
		new_area = get_area(owner.mob)

	soundscape_playlist = new_area.soundscape_playlist

	var/sound/S = sound(null,1,0,SOUND_CHANNEL_AMBIENCE)
	
	S.volume = 100 * owner.volume_preferences[VOLUME_AMB]
	S.environment = new_area.sound_environment
	S.status = SOUND_STREAM
	
	if(!force_cur_amb)
		if(new_area.ambience_exterior == ambience)
			S.status |= SOUND_UPDATE
		else 
			ambience = new_area.ambience_exterior
	
	var/muffle
	if(new_area.ceiling_muffle)
		switch(new_area.ceiling)
			if(CEILING_NONE)
				muffle = 0 
			if(CEILING_GLASS)
				muffle = MUFFLE_MEDIUM
			if(CEILING_METAL)
				muffle = MUFFLE_HIGH
			else
				S.volume = 0
	
	muffle += new_area.base_muffle
	
	S.echo = list(muffle)
	S.file = ambience
	if(!owner.prefs.toggles_sound & SOUND_AMBIENCE)
		S.status |= SOUND_MUTE
	sound_to(owner, S)


/datum/soundOutput/proc/update_soundscape()
	scape_cooldown--
	if(scape_cooldown <= 0)
		if(soundscape_playlist.len)
			var/sound/S = sound()
			S.file = pick(soundscape_playlist)
			S.volume = 100 * owner.volume_preferences[VOLUME_AMB]
			S.x = pick(1,-1)
			S.z = pick(1,-1)
			S.y = 1
			S.channel = SOUND_CHANNEL_SOUNDSCAPE
			sound_to(owner, S)
		var/area/A = get_area(owner.mob)
		if(A)
			scape_cooldown = pick(A.soundscape_interval, A.soundscape_interval + 1, A.soundscape_interval -1)
		else
			scape_cooldown = INITIAL_SOUNDSCAPE_COOLDOWN

/datum/soundOutput/proc/apply_status()
	var/sound/S = sound()
	if(status_flags & EAR_DEAF_MUTE)
		S.status = SOUND_MUTE | SOUND_UPDATE
		sound_to(owner, S)
	else
		S.status = SOUND_UPDATE
		sound_to(owner, S)

/client/proc/adjust_volume_prefs(var/volume_key, var/prompt = "", var/channel_update = 0)
	volume_preferences[volume_key]	= (input(prompt, "Volume", volume_preferences[volume_key]*100) as num) / 100
	if(volume_preferences[volume_key] > 1)
		volume_preferences[volume_key] = 1
	if(volume_preferences[volume_key] < 0)
		volume_preferences[volume_key] = 0
	if(channel_update)
		var/sound/S = sound()
		S.channel = channel_update
		S.volume = 100 * volume_preferences[volume_key]
		S.status = SOUND_UPDATE
		sound_to(src, S)	

/client/verb/adjust_volume_sfx()
	set name = "S : Adjust Volume SFX"
	set category = "Preferences"
	adjust_volume_prefs(VOLUME_SFX, "Set the volume for sound effects", 0)
			
/client/verb/adjust_volume_ambience()
	set name = "S : Adjust Volume Ambience"
	set category = "Preferences"
	adjust_volume_prefs(VOLUME_AMB, "Set the volume for ambience and soundscapes", 0)
	soundOutput.update_ambience()

/client/verb/adjust_volume_admin_music()
	set name = "S : Adjust Volume Admin MIDIs"
	set category = "Preferences"
	adjust_volume_prefs(VOLUME_ADM, "Set the volume for admin MIDIs", SOUND_CHANNEL_ADMIN_MIDI)

/client/verb/adjust_volume_lobby_music()
	set name = "S : Adjust Volume LobbyMusic"
	set category = "Preferences"
	adjust_volume_prefs(VOLUME_LOBBY, "Set the volume for Lobby Music", SOUND_CHANNEL_LOBBY)