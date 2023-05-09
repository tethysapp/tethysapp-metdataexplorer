import yaml
try:
    with open("install.yml") as f:
        install_yml = yaml.safe_load(f)
        channels = install_yml.get('requirements').get('conda').get('channels')
        channelString = ""
        if "conda-forge" not in channels:
            channels.insert(0, "conda-forge")
        for channel in channels:
            channelString = channelString + " -c " + channel
        buildCommand = "conda mambabuild" + channelString + " --output-folder . ."
        print(buildCommand)
except Exception:
    # print(e)
    print("conda mambabuild -c conda-forge --output-folder . .")
