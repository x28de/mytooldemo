<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: x-csrf-token', FALSE);

/**
 * Make sure that the WordPress bootstrap has run before continuing.
 */
// Assumes this lives under (wordpress)/whiteboard/php/
require (dirname(__FILE__) . '/../../wp-load.php');
extension_loaded('openssl') or die('The openssl extension is required.' . PHP_EOL);

if (is_user_logged_in()) {
//     $secret = "censored";
    $string_to_sign = $_POST['socket_id'] . ':' . $_POST['channel_name'];
    
    $pusherkey = "4adbc41a101586f6da84";
    $signed = hash_hmac("SHA256", $string_to_sign, $secret, FALSE);
    echo '{"auth":"' . $pusherkey . ':' . $signed . '"}';
} else {
    header('HTTP/1.0 403 Forbidden');
}
?>