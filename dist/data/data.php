<?php
	$user = array(
		'first_name' => 'MongoDB',
		'last_name' => 'Fan',
		'tags' => array('developer','user')
	);


	// Configuration
	$dbhost = 'localhost';
	$dbname = 'test';

	// Connect to test database
	$m = new MongoClient();
	$db = $m -> selectDB($dbname);
	// $db = $m->$dbname;

	// Get the users collection
	$c_users = $db->users;

	$c_persons = $db->persons;

	$persons = json_decode(file_get_contents('allpeople.json'));
	var_dump($persons);
	foreach($persons as $p) {
		$c_persons->save($p);	
	}

	// Insert this new document into the users collection
	//$c_users->save($user);

?>