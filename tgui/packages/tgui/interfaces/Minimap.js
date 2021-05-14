import { useBackend, useLocalState } from '../backend';
import { Box, Tooltip, Icon, Stack } from '../components';
import { Window } from '../layouts';

export const Minimap = (props, context) => {
  const { data } = useBackend(context);
  const {
    map_name,
    map_size_x,
    map_size_y,
    icon_size,
    coord_data,
    player_coord,
    player_ref,
    player_viewsize = 36,
  } = data;

  const [selectedName, setSelectedName] = useLocalState(context, "selected_name", null);

  const minimapPadding = 10;

  const map_size_tile_x = (map_size_x/icon_size);
  const map_size_tile_y = (map_size_y/icon_size);

  const view_offset = player_viewsize/2;

  let background_loc = [
    Math.max(
      Math.min(0, -(player_coord[0]-view_offset)*icon_size),
      -(map_size_tile_x-player_viewsize)*icon_size
    ),
    Math.max(
      Math.min(0, -(map_size_tile_y-player_coord[1]-view_offset)*icon_size),
      -(map_size_tile_y-player_viewsize)*icon_size
    ),
  ];

  const globalToLocal = coord => {
    const newCoord = [];
    newCoord[0] = (coord[0])*icon_size + background_loc[0];
    newCoord[1] = ((map_size_tile_y-coord[1])*icon_size) + background_loc[1];

    if (newCoord[0] < 0 || newCoord[0] > icon_size*player_viewsize
      || newCoord[1] < 0 || newCoord[1] > icon_size*player_viewsize) {
      return null;
    }
    return newCoord;
  };

  return (
    <Window
      width={icon_size*player_viewsize + minimapPadding*2}
      height={icon_size*player_viewsize + minimapPadding*2 + 30}
      theme="engi"
      resizable={false}
    >
      <Window.Content id="minimap">
        <Stack>
          <Stack.Item>
            <Box
              className="Minimap__Map"
              style={{
                'background-image': `url('minimap.${map_name}.png')`,
                'background-repeat': "no-repeat",
                'background-position-x': `${background_loc[0]}px`,
                'background-position-y': `${background_loc[1]}px`,
                'width': `${icon_size*player_viewsize}px`,
                'height': `${icon_size*player_viewsize}px`,
              }}
              position="absolute"
              left={`${minimapPadding}px`}
              top={`${minimapPadding}px`}
              onClick={() => setSelectedName(null)}
            >
              {coord_data.map(val => {
                let object_coord = val.coord;
                if (val.ref === player_ref) object_coord = player_coord;
                const local_coord = globalToLocal(object_coord);
                if (!local_coord) return;
                return (
                  <Object
                    key={val.ref}
                    name={val.name}
                    coord={local_coord}
                    icon={val.icon}
                    color={val.color}
                    obj_ref={val.ref}
                    obj_width={val.width}
                    obj_height={val.height}
                  />
                );
              })}
            </Box>
          </Stack.Item>
        </Stack>
      </Window.Content>
    </Window>
  );
};

export const Object = (props, context) => {
  const { data } = useBackend(context);
  const { icon_size } = data;
  const {
    name,
    coord,
    icon,
    color,
    obj_ref,
    obj_width,
    obj_height,
    ...rest
  } = props;

  const [selectedName, setSelectedName] = useLocalState(context, "selected_name", null);
  let object_opacity = 1;

  if (selectedName && selectedName !== obj_ref) {
    object_opacity = 0.4;
  }

  return (
    <Box
      className="Minimap__Player"
      opacity={object_opacity}
      width="10%"
      onClick={e => {
        setSelectedName(obj_ref);
        e.stopPropagation();
      }}
      {...rest}
      position="absolute"
      left={`${coord[0]-icon_size}px`}
      top={`${coord[1]-((obj_height-1)*icon_size)}px`}
    >
      <Stack vertical fill>
        <Stack.Item>
          <Box
            as="span"
            className="Minimap__Player_Icon"
            position="absolute"
            backgroundColor={color}
            width={`${icon_size*obj_width}px`}
            height={`${icon_size*obj_height}px`}
          />
        </Stack.Item>
        <Stack.Item
          className="Minimap__InfoBox"
          ml={selectedName === obj_ref
            ? `${icon_size*obj_width}px`
            : `${(icon_size*obj_width)/2}px`}
          mt={selectedName === obj_ref
            ? `${icon_size*obj_height}px`
            : `${(obj_height-1)*icon_size}px`}>
          <Box
            position="absolute"
            px={1}
            py={1}
            className={`Minimap__InfoBox${
              selectedName === obj_ref? "--detailed" : ""}`}
          >
            <Stack>
              {selectedName === obj_ref && (
                <Stack.Item>
                  <Icon name={icon} />
                </Stack.Item>
              )}
              <Stack.Item>
                {name}
              </Stack.Item>
            </Stack>
          </Box>
        </Stack.Item>
      </Stack>
    </Box>
  );
};
