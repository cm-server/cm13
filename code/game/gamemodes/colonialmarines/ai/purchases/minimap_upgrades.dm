/datum/pointshop_product/marine/minimap
	abstract_type = /datum/pointshop_product/marine/minimap
	category = "Minimap"
	var/minimap_flag

/datum/pointshop_product/marine/minimap/purchase_product(mob/user)
	. = ..()
	if(!. || !minimap_flag)
		return
	for(var/datum/game_map/GM as anything in SSminimap.minimaps)
		GM.flags_minimap |= minimap_flag

	purchased = TRUE

/datum/pointshop_product/marine/minimap/lifeform
	name = "Lifeform Scanner"
	desc = "Detects nearby lifeforms on your minimaps."
	icon_state = "navigation"
	cost = 100
	minimap_flag = MINIMAP_FLAG_SHOW_XENO

/datum/pointshop_product/marine/minimap/loot
	name = "Loot Scanner"
	desc = "Detects nearby loot on your minimaps."
	icon_state = "terminal"
	cost = 60
	minimap_flag = MINIMAP_FLAG_SHOW_LOOT
