#!/bin/bash
export PATH="$HOME/.nargo/bin:$PATH"
cd map_to_curve_noir
nargo test > ../test_out.txt 2>&1
cd ../circuit_map
nargo info > ../info_map.txt
cd ../circuit_pos
nargo info > ../info_pos.txt
cd ../circuit_sha
nargo info > ../info_sha.txt
