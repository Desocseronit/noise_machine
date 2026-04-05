<?php
require_once 'Database.php';

$db = Database::instance('host=localhost port=5452 dbname=noise_machine user=postgres password=1');

$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

echo"<pre>";

if($data['type'] == 'create'){
    if($db->createNewRecord('presets' , ['id','name'] , [$data['id'],$data['name']])){
        $json = json_decode($data['json'], true);
        foreach($json as $key=>$val){
            $sound_id = $db->findRecord('sounds', 'id', "name = '".$key."'");
            $db->createNewRecord('preset_sounds', ['preset_id', 'sound_id', 'volume'], [$data['id'],$sound_id['id'],$val]);
            
        }
        echo "{message: 'succes'}";
    }
    else echo '{message: "preset`s alredy exist"}';
}
elseif($data['type'] == 'load'){
    $presetId = $db->findRecord('presets', '*' , "name = '".$data['requiredName']."'")[0]['id'];
    $rows = $db->findRecord('preset_sounds', '*', "preset_id = '".$presetId."'");
    $soundNames = [];
    $volumes = [];
    foreach($rows as $row){
        array_push($soundNames, $db->findRecord('sounds', '*' , "id = '".$row['sound_id']."'")[0]['name']);
        array_push($volumes, $row['volume']);
    }
    $presetSoundsJson = formJson($soundNames , $volumes);
    
    $presetJson = [];
    $presetJson['id'] = $presetId;
    $presetJson['name'] = $data['requiredName'];
    $presetJson['json'] = $presetSoundsJson;
    $presetJson['isGlobal'] = true;

    echo json_encode($presetJson);
}


