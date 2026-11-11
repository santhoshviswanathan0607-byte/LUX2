import { test, expect } from '@playwright/test';

// Reusable login helper
async function loginAndOpenSettings(page) {

  await page.goto('/signin');

  await page.locator('#auth-email').fill('bharthesh0001@gmail.com');

  await page.locator('#auth-password').fill('000BHARATHESH@000');

  await page.locator('#auth-signin-submit-btn').click();

  await expect(page).not.toHaveURL(/signin/);

  await page.goto('/settings/basic');

  await expect(
    page.getByRole('heading', { name: 'Basic settings' })
  ).toBeVisible();
}



test('setting-001: Verify Basic Settings page elements', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Verify Appearance text
  await expect(page.getByText('Appearance')).toBeVisible();

  // Verify Light theme button
  await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();

  // Verify Dark theme button
  await expect( page.getByRole('button', { name: 'Dark' })).toBeVisible();

});





test('SETTINGS-002: Verify Light theme selection', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Light' }).click();

  await expect(
    page.getByRole('button', { name: 'Light' })
  ).toBeVisible();
});

test('SETTINGS-003: Verify Dark theme selection', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Dark' }).click();

  await expect(
    page.getByRole('button', { name: 'Dark' })
  ).toBeVisible();
});

test('SETTINGS-004: Verify Dark theme persistence after refresh', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Select Dark theme
  await page.getByRole('button', { name: 'Dark' }).click();

  // Refresh the page
  await page.reload();

  // Verify Basic Settings page is displayed
  await expect(
    page.getByRole('heading', { name: 'Basic settings' })
  ).toBeVisible();

  // Verify Dark theme button is visible
  await expect(
    page.getByRole('button', { name: 'Dark' })
  ).toBeVisible();

});


test('SETTINGS-005: Verify Notification Settings navigation', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Click Notification Settings
  await page.getByText('Notification settings', { exact: true }).click();

  // Verify Notification Settings page
  await expect(
    page.getByRole('heading', { name: 'Notification settings' })
  ).toBeVisible();

});

test('SETTINGS-006: Verify notification preferences are displayed', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Navigate to Notification Settings
  await page.getByRole('button', { name: 'Notification settings' }).click();

  // Verify Notification Settings heading
  await expect(
    page.getByRole('heading', { name: 'Notification Settings' })
  ).toBeVisible();

  // Verify Mentions notification
  await expect(
    page.getByRole('button', { name: /Mentions/ })
  ).toBeVisible();

  // Verify Comments notification
  await expect(
    page.getByRole('button', { name: /Comments/ })
  ).toBeVisible();

  // Verify Direct messages notification
  await expect(
    page.getByRole('button', { name: /Direct messages/ })
  ).toBeVisible();

  // Verify Task updates notification
  await expect(
    page.getByRole('button', { name: /Task updates/ })
  ).toBeVisible();

});


test('SETTINGS-007: Verify enabling notification preferences', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Navigate to Notification Settings
  await page.getByRole('button', { name: 'Notification settings' }).click();

  // Locate disabled Task updates notification
  const taskUpdates = page.getByRole('button', {
    name: /Task updates/
  });

  // Verify initially disabled
  await expect(taskUpdates).not.toHaveAttribute('aria-pressed', 'true');

  // Enable Task updates
  await taskUpdates.click();

  // Verify notification is enabled
  await expect(taskUpdates).toHaveAttribute('aria-pressed', 'true');

});

test('SETTINGS-008: Verify disabling notification preferences', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Navigate to Notification Settings
  await page.getByRole('button', { name: 'Notification settings' }).click();

  // Locate enabled Mentions notification
  const mentions = page.getByRole('button', {
    name: /Mentions/
  });

  // Verify initially enabled
  await expect(mentions).toHaveAttribute('aria-pressed', 'true');

  // Disable Mentions
  await mentions.click();

  // Verify notification is disabled
  await expect(mentions).toHaveAttribute('aria-pressed', 'false');

});


test('SETTINGS-009: Verify Language & Region navigation', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Click Language & Region
  await page.getByRole('button', {
    name: 'Language & region'
  }).click();

  // Verify Language & Region page heading
  await expect(
    page.getByRole('heading', { name: /Language & Region/i })
  ).toBeVisible();

});


test('SETTINGS-010: Verify language options are displayed', async ({ page }) => {

  // Login and open Settings
  await loginAndOpenSettings(page);

  // Navigate to Language & Region
  await page.getByRole('button', {
    name: 'Language & region'
  }).click();

  // Verify Language & Region heading
  await expect(
    page.getByRole('heading', { name: /Language & Region/i })
  ).toBeVisible();

  // Verify language field is displayed
  await expect(
    page.getByText(/Language/i).first()
  ).toBeVisible();

});



test('SETTINGS-011: Verify Password Settings navigation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await expect(
    page.getByRole('heading', { name: /Password/i })
  ).toBeVisible();
});



test('SETTINGS-012: Verify Password Change Form Elements', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await expect(
    page.getByRole('heading', { name: 'Change Password' })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Current Password *',
      exact: true
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'New Password *',
      exact: true
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Re-enter New Password *',
      exact: true
    })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeVisible();
});



test('SETTINGS-013: Verify Forgot Current Password option', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const forgotPassword = page.getByRole('button', {
    name: 'Forgot current password?'
  });

  await expect(forgotPassword).toBeVisible();
  await expect(forgotPassword).toBeEnabled();

  await forgotPassword.click();
});



test('SETTINGS-014: Verify Current Password Field Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const currentPassword = page.getByRole('textbox', {
    name: 'Current Password *',
    exact: true
  });

  await expect(currentPassword).toBeVisible();
  await expect(currentPassword).toHaveAttribute('required', '');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});



test('SETTINGS-015: Verify New Password Field Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const newPassword = page.getByRole('textbox', {
    name: 'New Password *',
    exact: true
  });

  await expect(newPassword).toBeVisible();
  await expect(newPassword).toHaveAttribute('required', '');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});



test('SETTINGS-016: Verify Confirm Password Field Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const confirmPassword = page.getByRole('textbox', {
    name: 'Re-enter New Password *',
    exact: true
  });

  await expect(confirmPassword).toBeVisible();
  await expect(confirmPassword).toHaveAttribute('required', '');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});



test('SETTINGS-017: Verify Show/Hide Current Password', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const currentPassword = page.locator('#current-password-input');

  await currentPassword.fill('TestPassword123');

  const showButton = page.getByRole('button', {
    name: 'Show password'
  }).first();

  await expect(showButton).toBeVisible();
  await showButton.click();

  const hideButton = page.getByRole('button', {
    name: 'Hide password'
  }).first();

  await expect(hideButton).toBeVisible();

  await hideButton.click();

  await expect(
    page.getByRole('button', { name: 'Show password' }).first()
  ).toBeVisible();
});



test('SETTINGS-018: Verify Show/Hide New Password', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  const newPassword = page.locator('#new-password-input');

  await newPassword.fill('TestPassword123');

  // Locate the Show button associated with New Password
  const newPasswordContainer = newPassword.locator('xpath=..');

  const showButton = newPasswordContainer.getByRole('button', {
    name: 'Show password'
  });

  await expect(showButton).toBeVisible();
  await showButton.click();

  const hideButton = newPasswordContainer.getByRole('button', {
    name: 'Hide password'
  });

  await expect(hideButton).toBeVisible();
  await hideButton.click();

  await expect(
    newPasswordContainer.getByRole('button', {
      name: 'Show password'
    })
  ).toBeVisible();
});


test('SETTINGS-019: Verify Password Mismatch Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await page.locator('#current-password-input').fill('IncorrectTest123');

  await page.locator('#new-password-input').fill('TestPassword123!');

  await page.locator('#confirm-password-input').fill('DifferentPassword123!');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});

test('SETTINGS-020: Verify Weak Password Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await page.locator('#current-password-input')
    .fill('YOUR_VALID_CURRENT_PASSWORD');

  await page.locator('#new-password-input').fill('test123');

  await page.locator('#confirm-password-input').fill('test123');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});


test('SETTINGS-021: Verify Empty Current Password Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await page.locator('#new-password-input').fill('TestPassword123!');
  await page.locator('#confirm-password-input').fill('TestPassword123!');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});


test('SETTINGS-022: Verify Empty New Password Validation', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Password' }).click();

  await page.locator('#current-password-input')
    .fill('YOUR_VALID_CURRENT_PASSWORD');

  await page.locator('#confirm-password-input')
    .fill('TestPassword123!');

  await expect(
    page.getByRole('button', { name: 'Save Password' })
  ).toBeDisabled();
});


test('SETTINGS-023: Verify Time Zone field visibility', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', {
    name: 'Language & region'
  }).click();

  // Verify Timezone heading
  await expect(
    page.getByRole('heading', { name: 'Timezone' })
  ).toBeVisible();

  // Verify Timezone dropdown
  await expect(
    page.getByRole('combobox', { name: 'Timezone' })
  ).toBeVisible();
});


test('SETTINGS-024: Verify Time Zone dropdown options', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', {
    name: 'Language & region'
  }).click();

  const timeZone = page.getByRole('combobox', {
    name: 'Timezone'
  });

  await expect(timeZone).toBeVisible();

  // Verify total options
  await expect(timeZone.locator('option')).toHaveCount(8);

  // Verify specific options
  await expect(timeZone.locator('option', {
    hasText: 'India'
  })).toBeAttached();

  await expect(timeZone.locator('option', {
    hasText: 'Dubai'
  })).toBeAttached();

  await expect(timeZone.locator('option', {
    hasText: 'London'
  })).toBeAttached();

  // Verify selected timezone value
  await expect(timeZone).toHaveValue('Asia/Kolkata');

  // Verify displayed selected option
  await expect(timeZone.locator('option:checked'))
    .toHaveText('(GMT+05:30) India');
});



test('SETTINGS-025: Verify Time Zone selection', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', {
    name: 'Language & region'
  }).click();

  const timeZone = page.getByRole('combobox', {
    name: 'Timezone'
  });

   await expect(timeZone).toBeVisible();

  // Get currently selected timezone
  const currentValue = await timeZone.inputValue();

  // Find another available timezone
  const availableValue = await timeZone.locator('option')
    .evaluateAll((options, current) => {
      return options.find(option =>
        !option.disabled &&
        option.value !== '' &&
        option.value !== current
      )?.value;
    }, currentValue);

  // Verify another option exists
  expect(availableValue).toBeTruthy();

  // Select another timezone
  await timeZone.selectOption(availableValue);

  // Verify timezone selection
  await expect(timeZone).toHaveValue(availableValue);
});

test('SETTINGS-001: Verify Settings icon opens a neutral page instead of forcing Basic settings', async ({ page }) => {
  // ✅ Use the helper defined in this file
  await loginAndOpenSettings(page);

  // Navigate to a neutral page (People) so we can click the gear icon from there
  await page.goto('/people');

  // Click the Settings gear icon
  const settingsBtn = page.getByRole('button', { name: 'Settings', exact: true }).first();
  await settingsBtn.click();

  await page.waitForTimeout(1000);

  // Assert the app did NOT force /settings/basic
  await expect(page, 'Bug: Clicking Settings auto-routes to /settings/basic without user consent')
    .not.toHaveURL(/.*\/settings\/basic/);

  const basicSettingsBtn = page.getByRole('button', { name: 'Basic settings' });
  await expect(basicSettingsBtn, 'Bug: Basic settings is auto-selected in the sidebar')
    .not.toHaveClass(/active/);
});
test('PROFILE-001: Profile picture should enlarge on click (KNOWN BUG)', async ({ page }) => {
  await loginAndOpenSettings(page);

  await page.getByRole('button', { name: 'Personal info' }).click();

  const profilePicture = page.getByRole('img', { name: 'bharathesh ts' });
  await expect(profilePicture).toBeVisible();

  // Click the image
  await profilePicture.click();

 
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
});
//test.fail(true, 'BUG: Email section is missing the edit button');

test('PROFILE-002: Verify email section has an edit button', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.getByRole('button', { name: 'Personal info' }).click();

  // Verify text is there
  await expect(page.getByText('Email', { exact: true })).toBeVisible();
  await expect(page.getByText('bharthesh0001@gmail.com', { exact: true })).toBeVisible();

  // This will fail (which is expected due to test.fail) because the button is missing
  const editEmailButton = page.getByRole('button', { name: /edit email/i });
  await expect(editEmailButton).toBeVisible();
});

//test.fail(true, 'BUG: Location section is missing the edit button');
test('PROFILE-003: Verify location section has an edit button', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.getByRole('button', { name: 'Personal info' }).click();

  // Scope to the summary row to avoid the <h3>Location</h3> collision
  const summaryRow = page
    .getByRole('strong').filter({ hasText: /^Location$/ })
    .locator('..');

  await expect(summaryRow).toBeVisible();
  await expect(page.getByText('Bengaluru, Karnataka').first()).toBeVisible();

  // Check for the edit button inside the summary row
  const editLocationButton = summaryRow.getByRole('button', { name: /edit location/i });
  await expect(editLocationButton).toBeVisible();
});

test('PROFILE-004: Verify mobile phone prevents typing more than 10 digits', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.getByRole('button', { name: 'Personal info' }).click();
  await page.getByRole('button', { name: 'Edit mobile number' }).click();

  const phoneInput = page.locator('input[type="tel"]');
  await expect(phoneInput).toBeVisible();

  // 1. Clear the input
  await phoneInput.clear();

  // 2. Try to type a 20-digit number
  const longNumber = '12345678901234567890';
  await phoneInput.fill(longNumber);

  await expect(phoneInput).toHaveValue('1234567890'); 
  
  
});



test('PROFILE-005: Verify mobile phone input has a country code selector (+91)', async ({ page }) => {
  // 1. Login and go to Profile
  await loginAndOpenSettings(page);
  await page.getByRole('button', { name: 'Personal info' }).click();

  // 2. Click Edit Mobile
  await page.getByRole('button', { name: 'Edit mobile number' }).click();

  // 3. Verify the input is visible
  const phoneInput = page.locator('input[type="tel"]');
  await expect(phoneInput).toBeVisible();

  
  const countryDropdown = page.getByRole('combobox', { name: /country code/i });

  const countryPrefix = page.getByText('+91', { exact: true });

  await expect(countryDropdown.or(countryPrefix)).toBeVisible();
});


test('PROFILE-006: Verify clicking General settings does not auto-select Basic settings', async ({ page }) => {
  await loginAndOpenSettings(page);
    // 1. Login (Note: Do not use the helper if the helper navigates directly to /settings/basic. 
  // We need to navigate to a neutral page first to test the menu click)
  await page.goto('/settings/personal'); 
  // OR just login and ensure you are on the Personal Info page before clicking.

  const generalSettingsBtn = page.getByRole('button', { name: 'General settings' });
  const basicSettingsBtn = page.getByRole('button', { name: 'Basic settings' });

  // 2. Click ONLY the "General settings" parent
  await generalSettingsBtn.click();

  // 3. Assert that the UI did NOT auto-select "Basic settings"
  // If the app auto-navigates and highlights it, this test will fail (turning RED).
  await expect(basicSettingsBtn).not.toHaveClass(/active|selected/);

  // 4. Optional: Assert that the URL did not change to /settings/basic automatically
  await expect(page).not.toHaveURL(/.*\/settings\/basic/);
});



test('PROFILE-007: Verify Basic Settings contains more than just the theme toggle', async ({ page }) => {
  await loginAndOpenSettings(page);

  // 1. Verify the heading
  await expect(page.getByRole('heading', { name: 'Basic settings' })).toBeVisible();

  // 2. Verify the Appearance theme toggle exists
  await expect(page.getByText('Appearance')).toBeVisible();

  // 3. Target ONLY the main content section (ignoring the sidebar)
  const settingsContent = page.locator('section.settings-page');

  // 4. Assert that a Language or Timezone heading/form exists INSIDE that section
  // We use getByRole('heading') or getByRole('combobox') to ensure it's a real setting, not just a sentence.
  const extraSetting = settingsContent.getByRole('heading', { name: /Language|Timezone|Time Format/i })
    .or(settingsContent.getByRole('combobox', { name: /Language|Timezone/i }));

  // Because the DOM only has "Appearance", this will fail after 5 seconds.
  await expect(extraSetting).toBeVisible({ timeout: 5000 });
});


test('PROFILE-008: Verify changing language actually translates the UI', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.goto('/settings/language');

  // 1. Verify we are in English initially
  await expect(page.getByRole('heading', { name: 'Time format' })).toBeVisible();

  // 2. Locate the native <select> dropdown
  const languageDropdown = page.getByRole('combobox', { name: 'Language' });
  
  // 3. Select Hindi natively
  await languageDropdown.selectOption({ label: 'Hindi' });

  // 4. Confirm the selection actually registered
  await expect(languageDropdown).toHaveValue('hi'); 

  await expect(page.getByRole('heading', { name: 'Time format' })).toBeHidden({ timeout: 3000 });
});


test('PROFILE-009: First day setting persists after reload', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.goto('/settings/language');

  await page.getByRole('radio', { name: 'Sunday' }).check({ force: true });
  await expect(page.getByRole('radio', { name: 'Sunday' })).toBeChecked();

  await page.waitForLoadState('networkidle');
  await page.reload();

  // Prove the choice stuck
  await expect(page.getByRole('radio', { name: 'Sunday' })).toBeChecked();
});

test('PROFILE-010: Verify Send Code flow completes successfully', async ({ page }) => {
  await loginAndOpenSettings(page);
  await page.goto('/settings/password');

  await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();

  await page.locator('.forgot-toggle-link').click();
  await expect(
    page.getByRole('heading', { name: 'Reset via Email Verification Code' })
  ).toBeVisible({ timeout: 5000 });

  const sendCodeBtn = page.getByRole('button', { name: 'Send Code' });
  await expect(sendCodeBtn).toBeVisible({ timeout: 10000 });
  await expect(sendCodeBtn).toBeEnabled();

  // NEW: Actually click Send Code and capture the "success" message
  await sendCodeBtn.click();

  // This assertion proves the UI CLAIMS to have sent the email.
  // Combined with the empty inbox, this is the proof of the bug.
  const successMsg = page.getByText(/code sent|sent successfully|check your email|verification code sent/i);
  await expect(successMsg).toBeVisible({ timeout: 10000 });

  // Take screenshot as evidence of the false-positive UI
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `C:\\Users\\Rentla.in\\Pictures\\Screenshots\\send-code-success-but-no-email-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[SCREENSHOT] ${screenshotPath}`);
});
/*
test('PROFILE-011: Capture Session History and log displayed locations', async ({ page }) => {
  await loginAndOpenSettings(page);

  // 1. Navigate DIRECTLY to the route instead of fighting the accordion menu
  await page.goto('/settings/session');

  // 2. Wait for the main page heading to ensure it loaded
  await expect(page.getByRole('heading', { name: 'Session history' })).toBeVisible();

  // 3. Take the screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `C:\\Users\\Rentla.in\\Pictures\\Screenshots\\session-history-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);

  // 4. Wait for the data to load
  // Based on your recent DevTools screenshot, the rows are divs with class "session-item" 
  // (or similar), not a strict HTML <table>.
  const sessionCards = page.locator('.session-history > div'); 
  
  // Wait for at least one card to appear
  await expect(sessionCards.first()).toBeVisible();

  const count = await sessionCards.count();
  console.log(`\n--- DISPLAYING ${count} SESSIONS ---`);

  // 5. Extract the text from each card
  for (let i = 0; i < count; i++) {
    const cardText = await sessionCards.nth(i).innerText();
    console.log(`\nSession ${i + 1}:`);
    console.log(cardText); // This will print Device, Location, IP, etc.
    console.log('-------------------------');
  }
});*/


test('PROFILE-011: Capture Session History and log displayed locations', async ({ page }) => {
  test.setTimeout(60000);
  await loginAndOpenSettings(page);

  await page.goto('/settings/session');
  await expect(page.getByRole('heading', { name: 'Session history' })).toBeVisible();

  // 1. Wait for the first row's Location column (td 2) to actually have text inside it
  const firstRowLocationCell = page.locator('table tbody tr').first().locator('td').nth(1);
  
  // Wait until the cell is attached to the DOM and has a length greater than 0
  await expect(firstRowLocationCell).not.toBeEmpty({ timeout: 10000 });

  // 2. Take the screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `C:\\Users\\Rentla.in\\Pictures\\Screenshots\\session-history-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[SCREENSHOT] ${screenshotPath}`);

  // 3. Read ONLY the first 5 rows for logging
  const rows = page.locator('table tbody tr');
  const totalRows = await rows.count();
  console.log(`\n--- DISPLAYING ${totalRows} SESSIONS (showing first 5) ---`);

  for (let i = 0; i < Math.min(5, totalRows); i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');
    const device   = (await cells.nth(0).innerText()).trim();
    const location = (await cells.nth(1).innerText()).trim();
    const ip       = (await cells.nth(2).innerText()).trim();
    const lastUsage = (await cells.nth(3).innerText()).trim();

    console.log(`Row ${i + 1}:`);
    console.log(`  Device: ${device}`);
    console.log(`  Location: ${location}`);
    console.log(`  IP: ${ip}`);
    console.log(`  Last Usage: ${lastUsage}`);
    console.log('-------------------------');
  }

  // 4. Grab the location value AFTER we know it's loaded
  const firstLocation = (await firstRowLocationCell.innerText()).trim();
  console.log(`\n[ASSERTION] Checking first location: "${firstLocation}"`);

  // 5. The Assertion (This WILL fail and turn RED if it still says Chennai)
  expect(
    firstLocation,
    `Bug: Session location shows "${firstLocation}" instead of "Bengaluru, Karnataka, IN"`
  ).not.toContain('Chennai');
});