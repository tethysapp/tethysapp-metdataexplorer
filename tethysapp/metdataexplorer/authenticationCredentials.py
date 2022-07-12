import os
from django.http import JsonResponse
from tethys_sdk.routing import controller


@controller(
    name='getCredentialsFromServer',
    url='getCredentialsFromServer/',
)
def get_authentication_credentials_from_file(request):
    file_with_credentials = open(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                              'workspaces', 'app_workspace', '.netrc'), 'r')
    lines = file_with_credentials.readlines()
    array_for_authentication_credentials = {}
    x = 1

    for line in lines:
        if line[:8] == 'machine ':
            pos1 = 8
            pos2 = line.find(' login ')
            pos3 = pos2 + 7
            pos4 = line.find(' password ')
            pos5 = pos4 + 10
            machine = line[pos1:pos2]
            user = line[pos3:pos4]
            pswd = line[pos5:].strip()

            array_for_authentication_credentials[x] = (machine, user, pswd)
        x += 1

    return_array = {'credentials': array_for_authentication_credentials}
    file_with_credentials.close()

    return JsonResponse(return_array)


def make_files_for_authentication_credentials():
    try:
        with open(os.open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'workspaces', 'app_workspace',
                                       '.netrc'), os.O_CREAT | os.O_WRONLY, 0o744), 'w') as fh:
            fh.truncate()
            fh.close()

        with open(os.open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'workspaces', 'app_workspace',
                                       '.urs_cookies'), os.O_CREAT | os.O_WRONLY, 0o744), 'w') as fl:
            fl.truncate()
            fl.close()

        with open(os.open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'workspaces', 'app_workspace',
                                       '.dodsrc'), os.O_CREAT | os.O_WRONLY, 0o744), 'w') as ft:
            ft.truncate()
            ft.write('HTTP.COOKIEJAR=' + os.path.join(os.path.dirname(os.path.realpath(__file__)), 'workspaces',
                                                      'app_workspace', '.urs_cookies') + '\nHTTP.NETRC='
                     + os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                    'workspaces', 'app_workspace', '.netrc'))
            ft.close()

    except Exception as e:
        print(e)


@controller(
    name='removeCredentialsFromServer',
    url='removeCredentialsFromServer/',
)
def remove_authentication_credentials_from_file(request):
    try:
        machine = request.POST.get('machine')
        username = request.POST.get('username')
        password = request.POST.get('password')

        string_to_remove = 'machine ' + machine + ' login ' + username + ' password ' + password + '\n'
        file_with_credentials = open(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                  'workspaces', 'app_workspace', '.netrc'), 'r+')
        lines = file_with_credentials.readlines()
        lines.remove(string_to_remove)
        file_with_credentials.close()

        new_file = open(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                     'workspaces', 'app_workspace', '.netrc'), 'w')
        for line in lines:
            new_file.write(line)

        new_file.close()

        message = {'successMessage': 'Credentials removed.'}

    except Exception as e:
        message = {
            'errorMessage': 'An error occurred while removing the credentials.',
            'error': str(e)
        }
    return JsonResponse(message)


# @controller(
#     name='addCredentialToServer',
#     url='addCredentialToServer/',
# )
# def write_authentication_credentials_to_file(request):
    # try:
    #         machine = request.POST.get('machine')
    #   username = request.POST.get('username')
    #   password = request.POST.get('password')
    #   file_with_credentials = open(os.path.join(os.path.dirname(os.path.realpath(__file__)),
    #                                             'workspaces', 'app_workspace', '.netrc'), 'a+')
    #   lines = file_with_credentials.readlines()
    #   if len(lines) == 0:
    #       file_with_credentials.write('machine ' + machine + ' login ' + username + ' password ' + password + '\n')
    #   elif lines[-1] == '\n':
    #       file_with_credentials.write('machine ' + machine + ' login ' + username + ' password ' + password + '\n')
    #   else:
    #       file_with_credentials.write('machine ' + machine + ' login ' + username + ' password ' + password + '\n')
    #
    #   file_with_credentials.close()
    #
    #   message = {'successMessage': 'Authentication Successfully Added.'}
    #
    # except Exception as e:
    #   message = {
    #       'errorMessage': 'An error occurred while adding the credentials.',
    #       'error': str(e)
    #   }
    # return JsonResponse(message)
